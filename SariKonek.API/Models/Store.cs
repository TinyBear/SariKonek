namespace SariKonek.API.Models;

public class Store
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string StoreName { get; set; } = "";
    public string QRCodeIdentifier { get; set; } = Guid.NewGuid().ToString("N");
    public string Address { get; set; } = "";
    public bool IsActive { get; set; } = true;
}