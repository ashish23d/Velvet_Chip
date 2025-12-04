// supabase/functions/send-shipping-confirmation/types.ts
// This file is a self-contained copy of the necessary types from the main application's types.ts
// It is required because Edge Functions cannot import files from outside their own directory during deployment.

export type Json = any;

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Cancelled by User' | 'Return Requested' | 'Return Approved';

export interface StatusUpdate {
    status: OrderStatus;
    timestamp: string;
    description: string;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface Order {
  id: string;
  userId: string;
  orderDate: string;
  currentStatus: OrderStatus;
  statusHistory: StatusUpdate[];
  totalAmount: number;
  shippingAddress: Address;
  items: CartItem[];
  payment: {
    method: 'COD' | 'Online';
  };
  customerEmail?: string;
  promotionCode?: string | null;
}

export interface MailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  templateType: 'order_status' | 'return_process' | 'promotional' | 'custom' | 'password_reset';
  placeholders: { [key: string]: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
}