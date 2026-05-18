const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact_email: string;
  created_at: string;
}

export type MovementType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';

export interface InventoryMovement {
  id: number;
  inventory_item_id: number;
  warehouse_id: number;
  user_id: number;
  vendor_id: number | null;
  movement_type: MovementType;
  quantity: number;
  notes: string | null;
  created_at: string;
}

export interface StockResult {
  inventory_item_id: number;
  warehouse_id: number;
  stock: number;
}

export const api = {
  users: {
    list: () => get<User[]>('/users/'),
    create: (data: { email: string; name: string }) => post<User>('/users/', data),
  },
  items: {
    list: () => get<InventoryItem[]>('/items/'),
    get: (id: number) => get<InventoryItem>(`/items/${id}`),
    create: (data: { sku: string; name: string; description?: string }) =>
      post<InventoryItem>('/items/', data),
  },
  warehouses: {
    list: () => get<Warehouse[]>('/warehouses/'),
    create: (data: { name: string; location: string }) => post<Warehouse>('/warehouses/', data),
  },
  vendors: {
    list: () => get<Vendor[]>('/vendors/'),
    create: (data: { name: string; contact_email: string }) => post<Vendor>('/vendors/', data),
  },
  movements: {
    list: (params?: { item_id?: number; warehouse_id?: number }) => {
      const q = new URLSearchParams();
      if (params?.item_id !== undefined) q.set('item_id', String(params.item_id));
      if (params?.warehouse_id !== undefined) q.set('warehouse_id', String(params.warehouse_id));
      const qs = q.toString();
      return get<InventoryMovement[]>(`/movements/${qs ? `?${qs}` : ''}`);
    },
    create: (data: {
      inventory_item_id: number;
      warehouse_id: number;
      user_id: number;
      vendor_id?: number;
      movement_type: MovementType;
      quantity: number;
      notes?: string;
    }) => post<InventoryMovement>('/movements/', data),
    getStock: (item_id: number, warehouse_id: number) =>
      get<StockResult>(`/movements/stock?item_id=${item_id}&warehouse_id=${warehouse_id}`),
  },
};
