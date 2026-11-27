namespace SariKonek.API.DTOs;

// Public view: no QR code, so customers can't skip the physical scan
public record StoreSummaryDto(Guid Id, string StoreName, string Address, bool IsActive);

// Owner view: includes the QR code string
public record StoreDto(Guid Id, string StoreName, string Address, string QRCodeIdentifier, bool IsActive);