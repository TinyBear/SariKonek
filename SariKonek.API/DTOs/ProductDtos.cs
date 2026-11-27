namespace SariKonek.API.DTOs;

public record ProductDto(Guid Id, Guid StoreId, string Name, decimal Price, int StockQuantity);
public record ProductRequest(string Name, decimal Price, int StockQuantity);