using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SariKonek.API.Data;
using SariKonek.API.DTOs;
using SariKonek.API.Models;
namespace SariKonek.API.Controllers;

[ApiController, Authorize]
public class ProductsController(AppDbContext db) : ControllerBase
{
    Guid UserId => Guid.Parse(User.FindFirstValue("sub")!);

    static ProductDto ToDto(Product p) => new(p.Id, p.StoreId, p.Name, p.Price, p.StockQuantity);

    static string? Validate(ProductRequest r) =>
        string.IsNullOrWhiteSpace(r.Name) ? "Name is required"
        : r.Price < 0 ? "Price cannot be negative"
        : r.StockQuantity < 0 ? "Stock cannot be negative"
        : null;

    [HttpGet("api/stores/{storeId:guid}/products")]
    public async Task<IActionResult> ForStore(Guid storeId)
    {
        var products = await db.Products.AsNoTracking()
            .Where(p => p.StoreId == storeId).OrderBy(p => p.Name).ToListAsync();
        return Ok(products.Select(ToDto));
    }

    [HttpPost("api/products"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Create(ProductRequest r)
    {
        if (Validate(r) is { } error) return BadRequest(error);
        var store = await db.Stores.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        if (store is null) return BadRequest("No store for this owner");

        var p = new Product { StoreId = store.Id, Name = r.Name.Trim(), Price = r.Price, StockQuantity = r.StockQuantity };
        db.Products.Add(p);
        await db.SaveChangesAsync();
        return Ok(ToDto(p));
    }

    [HttpPut("api/products/{id:guid}"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Update(Guid id, ProductRequest r)
    {
        if (Validate(r) is { } error) return BadRequest(error);
        var store = await db.Stores.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        if (store is null || p.StoreId != store.Id) return Forbid();

        p.Name = r.Name.Trim();
        p.Price = r.Price;
        p.StockQuantity = r.StockQuantity;
        await db.SaveChangesAsync();
        return Ok(ToDto(p));
    }

    [HttpDelete("api/products/{id:guid}"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var store = await db.Stores.FirstOrDefaultAsync(s => s.OwnerId == UserId);
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        if (store is null || p.StoreId != store.Id) return Forbid();

        // Keep order history intact: products that were ordered can't be deleted
        if (await db.OrderItems.AnyAsync(i => i.ProductId == id))
            return Conflict("This product has order history. Set its stock to 0 instead.");

        db.Products.Remove(p);
        await db.SaveChangesAsync();
        return Ok();
    }
}