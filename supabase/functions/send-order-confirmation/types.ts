// supabase/functions/send-order-confirmation/types.ts
// This file is a self-contained copy of the necessary types from the main application's types.ts
// It is required because Edge Functions cannot import files from outside their own directory during deployment.

export type Json = any;

export interface SiteSettings {
  primaryColor: string;
  activeLogoPath: string | null;
  previousLogoPaths: string[];
}

export interface ContactDetails {
  email: string;
  phone: string;
  address: string;
}

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
  uuid: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  description: string;
  images: string[];
  colors: { name: string; hex: string; uuid: string; images?: string[] }[];
  sizes: string[];
  specifications: { [key: string]: string };
  createdAt?: string;
  hsnCode?: string;
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
    status: 'Paid' | 'Pending';
    transactionId: string;
  };
  customerName?: string;
  customerEmail?: string;
  promotionCode?: string | null;
  invoice_number?: string | null;
  downloadable_invoice_url?: string | null;
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
