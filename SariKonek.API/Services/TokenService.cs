using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SariKonek.API.Models;

namespace SariKonek.API.Services;

public class TokenService(IConfiguration cfg)
{
    public string Create(ApplicationUser u)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, u.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, u.Email!),
            new Claim("role", u.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            cfg["Jwt:Issuer"],
            cfg["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}