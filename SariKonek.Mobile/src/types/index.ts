export type Role = 'Customer' | 'StoreOwner';

export interface Store {
  id: string;
  storeName: string;
  address: string;
  qrCodeIdentifier: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  stockQuantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

// Mirrors the API's AuthResponse DTO (used in Phase 9)
export interface AuthUser {
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse extends AuthUser {
  token: string;
}