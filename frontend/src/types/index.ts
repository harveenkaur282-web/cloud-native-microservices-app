export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string; // Numeric in PostgreSQL is serialized as string in JSON
  category: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  product_metadata: Record<string, any> | null;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: string; // Numeric(10,2) serialized as string
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface Inventory {
  id: number;
  product_id: number;
  available_quantity: number;
  reserved_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
}

export interface LoginResponse {
  message: string;
  username: string;
  access_token: string;
  token_type: string;
  email: string;
}
