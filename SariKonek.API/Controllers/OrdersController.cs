using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SariKonek.API.Data;
using SariKonek.API.DTOs;
using SariKonek.API.Models;
namespace SariKonek.API.Controllers;

[ApiController, Route("api/orders"), Authorize]
public class OrdersController(AppDbContext db) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirstValue("sub")!);

    static readonly Dictionary<OrderStatus, OrderStatus[]> Allowed = new()
    {
        [OrderStatus.Pending]        = [OrderStatus.Processing, OrderStatus.Cancelled],
        [OrderStatus.Processing]     = [OrderStatus.ReadyForPickup, OrderStatus.Cancelled],
        [OrderStatus.ReadyForPickup] = [OrderStatus.Completed, OrderStatus.Cancelled],
        [OrderStatus.Completed]      = [],
        [OrderStatus.Cancelled]      = [],
    };

    [HttpPost, Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(CreateOrderRequest req)
    {
        if (req.Items is null || req.Items.Count == 0) return BadRequest("Cart is empty");
        if (req.Items.Any(i => i.Quantity <= 0)) return BadRequest("Invalid quantity");

        var store = await db.Stores.AsNoTracking().FirstOrDefaultAsync(s => s.Id == req.StoreId && s.IsActive);
        if (store is null) return BadRequest("Store not found");

        // Merge duplicate product lines
        var lines = req.Items.GroupBy(i => i.ProductId)
            .Select(g => new OrderLine(g.Key, g.Sum(x => x.Quantity))).ToList();

        await using var tx = await db.Database.BeginTransactionAsync();
        var order = new Order { CustomerId = UserId, StoreId = store.Id };
        decimal total = 0;

        foreach (var line in lines)
        {
            var product = await db.Products.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == line.ProductId && p.StoreId == store.Id);
            if (product is null) { await tx.RollbackAsync(); return BadRequest("Invalid item"); }

            // Atomic: deduct only if enough stock remains
            var updated = await db.Products
                .Where(p => p.Id == product.Id && p.StockQuantity >= line.Quantity)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - line.Quantity));
            if (updated == 0) { await tx.RollbackAsync(); return Conflict($"Not enough stock for {product.Name}"); }

            order.Items.Add(new OrderItem { ProductId = product.Id, Quantity = line.Quantity, UnitPrice = product.Price });
            total += product.Price * line.Quantity; // price comes from the DB, never the client
        }

        order.TotalAmount = total;
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(new { order.Id, order.TotalAmount, order.Status });
    }

    [HttpGet("mine"), Authorize(Roles = "Customer")]
    public async Task<IActionResult> Mine() =>
        Ok(await Load(db.Orders.Where(o => o.CustomerId == UserId)));

    [HttpGet("store"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> ForStore()
    {
        var store = await db.Stores.AsNoTracking().FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (store is null) return NotFound("No store for this owner");
        return Ok(await Load(db.Orders.Where(o => o.StoreId == store.Id)));
    }

    [HttpPut("{id:guid}/status"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateStatusRequest req)
    {
        var store = await db.Stores.AsNoTracking().FirstOrDefaultAsync(s => s.OwnerId == UserId);

        await using var tx = await db.Database.BeginTransactionAsync();
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound();
        if (store is null || order.StoreId != store.Id) return Forbid();

        if (!Allowed[order.Status].Contains(req.Status))
            return Conflict($"Cannot change status from {order.Status} to {req.Status}");

        if (req.Status == OrderStatus.Cancelled)
        {
            foreach (var item in order.Items)
            {
                var qty = item.Quantity;
                await db.Products.Where(p => p.Id == item.ProductId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity + qty));
            }
        }

        order.Status = req.Status;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(new { order.Id, order.Status });
    }

    // Loads orders plus the names the app needs to display
    async Task<List<OrderDto>> Load(IQueryable<Order> query)
    {
        var orders = await query.Include(o => o.Items).AsNoTracking()
            .OrderByDescending(o => o.CreatedAt).ToListAsync();

        var productIds = orders.SelectMany(o => o.Items).Select(i => i.ProductId).Distinct().ToList();
        var storeIds = orders.Select(o => o.StoreId).Distinct().ToList();
        var customerIds = orders.Select(o => o.CustomerId).Distinct().ToList();

        var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name);
        var stores = await db.Stores.Where(s => storeIds.Contains(s.Id)).ToDictionaryAsync(s => s.Id, s => s.StoreName);
        var customers = await db.Users.Where(u => customerIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.FullName);

        return orders.Select(o => new OrderDto(
            o.Id, o.StoreId, stores.GetValueOrDefault(o.StoreId, ""),
            o.CustomerId, customers.GetValueOrDefault(o.CustomerId, ""),
            o.Status, o.TotalAmount, o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(i.ProductId, products.GetValueOrDefault(i.ProductId, ""), i.Quantity, i.UnitPrice)).ToList()
        )).ToList();
    }
}