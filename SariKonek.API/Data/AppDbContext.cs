using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SariKonek.API.Models;

namespace SariKonek.API.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Store> Stores => Set<Store>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Store>().HasIndex(s => s.QRCodeIdentifier).IsUnique();
        
        b.Entity<Product>().Property(p => p.Price).HasPrecision(10, 2);
        b.Entity<Order>().Property(o => o.TotalAmount).HasPrecision(10, 2);
        b.Entity<Order>().Property(o => o.Status).HasConversion<string>();
        b.Entity<OrderItem>().Property(i => i.UnitPrice).HasPrecision(10, 2);

        b.Entity<Store>().HasOne<ApplicationUser>().WithMany().HasForeignKey(s => s.OwnerId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Product>().HasOne<Store>().WithMany().HasForeignKey(p => p.StoreId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Order>().HasOne<ApplicationUser>().WithMany().HasForeignKey(o => o.CustomerId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Order>().HasOne<Store>().WithMany().HasForeignKey(o => o.StoreId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<OrderItem>().HasOne<Product>().WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}