using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SariKonek.API.Data;
using SariKonek.API.DTOs;
using SariKonek.API.Models;
using SariKonek.API.Services;

namespace SariKonek.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(UserManager<ApplicationUser> users, TokenService tokens, AppDbContext db) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest r)
    {
        if (r.Role != "Customer" && r.Role != "StoreOwner")
            return BadRequest("Invalid role");

        var user = new ApplicationUser
        {
            UserName = r.Email,
            Email = r.Email,
            FullName = r.FullName,
            Role = r.Role
        };

        var res = await users.CreateAsync(user, r.Password);
        if (!res.Succeeded)
            return BadRequest(res.Errors.Select(e => e.Description));

        if (r.Role == "StoreOwner")
        {
            db.Stores.Add(new Store
            {
                OwnerId = user.Id,
                StoreName = r.StoreName ?? r.FullName + "'s Store",
                Address = r.Address ?? ""
            });
            await db.SaveChangesAsync();
        }

        return Ok(new AuthResponse(tokens.Create(user), user.Email!, user.FullName, user.Role));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest r)
    {
        var user = await users.FindByEmailAsync(r.Email);
        if (user is null || !await users.CheckPasswordAsync(user, r.Password))
            return Unauthorized("Invalid credentials");

        return Ok(new AuthResponse(tokens.Create(user), user.Email!, user.FullName, user.Role));
    }

    // Verification endpoint: proves the JWT is accepted and the claims are read correctly
    [HttpGet("me"), Authorize]
    public IActionResult Me() => Ok(new
    {
        id = User.FindFirstValue("sub"),
        email = User.FindFirstValue("email"),
        role = User.FindFirstValue("role")
    });

    // Temporary role checks 
    [HttpGet("owner-only"), Authorize(Roles = "StoreOwner")]
    public IActionResult OwnerOnly() => Ok("You are a StoreOwner");

    [HttpGet("customer-only"), Authorize(Roles = "Customer")]
    public IActionResult CustomerOnly() => Ok("You are a Customer");
}