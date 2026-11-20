using Microsoft.AspNetCore.Identity;

namespace SariKonek.API.Models;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = "";
    public string Role { get; set; } = "Customer"; // Customer | StoreOwner
}