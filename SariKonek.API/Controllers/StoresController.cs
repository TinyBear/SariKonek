using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SariKonek.API.Data;
using SariKonek.API.DTOs;
using SariKonek.API.Models;
namespace SariKonek.API.Controllers;

[ApiController, Route("api/stores"), Authorize]
public class StoresController(AppDbContext db) : ControllerBase
{
    static StoreSummaryDto Summary(Store s) => new(s.Id, s.StoreName, s.Address, s.IsActive);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stores = await db.Stores.AsNoTracking()
            .Where(s => s.IsActive).OrderBy(s => s.StoreName).ToListAsync();
        return Ok(stores.Select(Summary));
    }

    [HttpGet("by-qr/{code}")]
    public async Task<IActionResult> ByQr(string code)
    {
        var store = await db.Stores.AsNoTracking()
            .FirstOrDefaultAsync(s => s.QRCodeIdentifier == code && s.IsActive);
        return store is null ? NotFound("Store not found") : Ok(Summary(store));
    }

    [HttpGet("mine"), Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Mine()
    {
        var ownerId = Guid.Parse(User.FindFirstValue("sub")!);
        var s = await db.Stores.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerId == ownerId);
        return s is null
            ? NotFound("No store for this owner")
            : Ok(new StoreDto(s.Id, s.StoreName, s.Address, s.QRCodeIdentifier, s.IsActive));
    }
}