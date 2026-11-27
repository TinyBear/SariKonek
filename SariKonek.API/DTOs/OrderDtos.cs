using SariKonek.API.Models;
namespace SariKonek.API.DTOs;

public record OrderLine(Guid ProductId, int Quantity);
public record CreateOrderRequest(Guid StoreId, List<OrderLine> Items);
public record UpdateStatusRequest(OrderStatus Status);

public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(
    Guid Id, Guid StoreId, string StoreName, Guid CustomerId, string CustomerName,
    OrderStatus Status, decimal TotalAmount, DateTime CreatedAt, List<OrderItemDto> Items);