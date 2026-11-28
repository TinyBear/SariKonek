import { api } from './api';
import type { Order, Product, Store } from '../types';

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (error as {
      response?: { data?: unknown; status?: number };
    }).response;

    if (typeof response?.data === 'string') {
      return response.data;
    }

    if (response?.data && typeof response.data === 'object') {
      const data = response.data as {
        message?: string;
        title?: string;
      };
      if (data.message) return data.message;
      if (data.title) return data.title;
    }

    if (response?.status) {
      return `Request failed (HTTP ${response.status}).`;
    }
  }

  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

function asArray<T>(data: unknown, resourceName: string): T[] {
  // Contract normalization point:
  // If Scalar shows a wrapper such as { items: [...] }, adapt it here.
  if (Array.isArray(data)) return data as T[];

  throw new Error(
    `Unexpected ${resourceName} response. Check the API response schema.`
  );
}

export async function getStores(): Promise<Store[]> {
  try {
    const response = await api.get('/stores');
    return asArray<Store>(response.data, 'stores');
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getStoreByQr(code: string): Promise<Store> {
  try {
    const response = await api.get(
      `/stores/by-qr/${encodeURIComponent(code)}`
    );
    return response.data as Store;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProducts(storeId: string): Promise<Product[]> {
  try {
    const response = await api.get(
      `/stores/${encodeURIComponent(storeId)}/products`
    );
    return asArray<Product>(response.data, 'products');
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface CreateOrderLine {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  storeId: string;
  items: CreateOrderLine[];
}

export async function createOrder(
  request: CreateOrderRequest
): Promise<unknown> {
  try {
    const response = await api.post('/orders', request);
    return response.data;
  } catch (error) {
    // Preserve the HTTP status so checkout can distinguish 409.
    throw error;
  }
}

export async function getMyOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/orders/mine');
    return asArray<Order>(response.data, 'orders');
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}