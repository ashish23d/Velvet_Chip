// This file is a self-contained copy of the necessary types from the main application's types.ts
// It is required because Edge Functions cannot import files from outside their own directory during deployment.

export type ReturnRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Transit' | 'Processing' | 'Completed' | 'Pickup Scheduled' | 'Item Inspected';

export interface ReturnStatusUpdate {
    status: ReturnRequestStatus;
    timestamp: string;
    description: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'offer' | 'system' | 'return';
  title: string;
  message: string;
  link?: string;
  timestamp: string; 
  read: boolean;
}

// Added for notification generation
export interface Product {
  name: string;
}

export interface CartItem {
  id: string;
  product: Product;
}
