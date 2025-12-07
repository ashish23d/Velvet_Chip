














/**
 * Type for JSONB columns in Supabase.
 * Using `any` to avoid "Type instantiation is excessively deep" error
 * that was caused by the recursive type definition and deep nesting of other types.
 */
export type Json = any;

export interface SiteSettings {
  primaryColor: string;
  activeLogoPath: string | null;
  previousLogoPaths: string[];
  // New Logo Settings
  logoType?: 'image' | 'text';
  textLogo?: string;
  fontFamily?: string;
  fontSize?: string; // e.g. "24px"
  imageWidth?: string; // e.g. "150px"
}

export interface ContactDetails {
  email: string;
  phone: string;
  address: string;
}

export interface SiteContent {
  id: string;
  data: {
    title?: string;
    text?: string;
    imagePath?: string;
    [key: string]: any;
  }
}

export interface SeasonalEditCard {
  id: string;
  ordering: number;
  card_type: 'custom' | 'product';
  is_active: boolean;
  image_path: string | null;
  title: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  product_id: number | null;
  reverse_layout: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  user_id: string;
  gst_details: {
    nature_of_transaction: string;
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    total_tax: number;
  };
  vendor_info: {
    name: string;
    gstin: string;
    address: string;
    email: string;
  };
  total_amount: number;
  pdf_url?: string;
  qr_code_url?: string;
  packet_id?: string;
  created_at: string;
}


export interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export interface MediaItem {
  path: string;
  type: 'image' | 'video';
}

export interface Slide {
  id: string;
  media: MediaItem[];
  text: string;
  showText: boolean;
}

export interface Notification {
  id: string;
  type: 'order' | 'offer' | 'system' | 'return';
  title: string;
  message: string;
  link?: string;
  timestamp: string; // ISO 8601 date string
  read: boolean;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Cancelled by User' | 'Return Requested' | 'Return Approved' | 'In Transit';

export interface StatusUpdate {
  status: OrderStatus;
  timestamp: string;
  description: string;
  location?: string; // e.g., "Mumbai Hub"
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
  // New modular invoice fields
  invoice_number?: string | null;
  downloadable_invoice_url?: string | null;
  // Logistics Fields
  courierName?: string | null; // e.g. FedEx
  trackingId?: string | null; // e.g. AWB123456
  trackingUrl?: string | null; // Link to courier site
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
  images: string[]; // Array of Supabase Storage paths
  colors: {
    name: string;
    hex: string;
    uuid: string;
    images?: string[];
    sizes?: { size: string; stock: number }[];
  }[];
  sizes: string[];
  specifications: { [key: string]: string };
  createdAt?: string;
  hsnCode?: string;
}

export type CardType =
  | 'hero'
  | 'banner'
  | 'image'
  | 'text'
  | 'split'
  | 'product_grid'
  | 'product_carousel'
  | 'category_highlight'
  | 'info_card'
  | 'video';

export type CardPlacement = 'home' | 'category_page' | 'product_page' | 'cart_page';

export interface CardAddon {
  id: string;
  type: CardType;
  title?: string;
  subtitle?: string;
  content?: string;
  image_path?: string;
  video_url?: string;
  cta_text?: string;
  cta_link?: string;
  target_type?: 'category' | 'product' | 'url' | 'manual' | 'none';
  target_id?: string;
  placement: CardPlacement;
  order: number;
  is_active: boolean;
  config?: {
    backgroundColor?: string;
    textColor?: string;
    textAlignment?: 'left' | 'center' | 'right';
    fullWidth?: boolean;
    height?: string; // e.g., '400px'
    [key: string]: any;
  };
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  heroImage: string; // for showcase cards
  pageHeroMedia?: MediaItem[] | null;
  pageHeroText?: string | null;
  showPageHeroText?: boolean;
  appImagePath?: string | null; // New field for app-specific category image
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  userImage: string; // Supabase Storage path for user's avatar
  productImages: string[]; // Array of Supabase Storage paths
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CartItem {
  id: string; // Unique ID for the cart item instance, e.g., "1-L-Blush Pink"
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface User {
  id: string;
  name: string;
  avatar?: string; // Supabase Storage path for user's avatar
  email?: string;
  password?: string;
  mobile?: string;
  role?: 'admin' | 'customer';
  dob?: string; // YYYY-MM-DD
  gender?: 'male' | 'female';
  createdAt?: string;
  status?: 'active' | 'blocked';
  addresses?: Address[];
  notifications?: Notification[];
  wishlist?: Product[];
  cart?: CartItem[];
  savedItems?: Product[];
  orders?: Order[];
  returns?: ReturnRequest[];
}

export interface PendingChange {
  id: string;
  type: 'return_request' | 'complaint' | string;
  description: string;
  author_name: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  data?: any;
}

export interface Promotion {
  id: number;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minPurchase: number;
  usageLimit: number;
  uses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface Announcement {
  text: string;
  link: string;
  isActive: boolean;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
  userId?: string | null;
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

// --- NEW RETURN TYPES ---

export type ReturnRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Transit' | 'Processing' | 'Completed' | 'Pickup Scheduled' | 'Item Inspected';
export type ReturnPickupStatus = 'Not Scheduled' | 'Scheduled' | 'Picked Up' | 'Returned to Warehouse';
export type ReturnInspectionStatus = 'Pending' | 'Passed' | 'Failed';
export type ReturnRefundStatus = 'Not Initiated' | 'Initiated' | 'Processed' | 'Rejected';

export interface ReturnStatusUpdate {
  status: ReturnRequestStatus;
  timestamp: string;
  description: string;
}

export interface ReturnRequest {
  id: string; // uuid
  order_id: string;
  item_id: string; // CartItem id
  user_id: string;
  reason: string;
  comments: string | null;
  type: 'refund' | 'replacement';
  images: string[] | null; // array of storage paths
  status: ReturnRequestStatus;
  pickup_status: ReturnPickupStatus;
  inspection_status: ReturnInspectionStatus;
  refund_status: ReturnRefundStatus;
  refund_amount: number | null;
  return_requested_at: string; // timestamptz
  updated_at: string; // timestamptz
  status_history: ReturnStatusUpdate[];
  // For convenience, joined data
  item?: CartItem;
  order?: Order;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string;
  mobile?: string | null;
  role?: 'admin' | 'customer' | null;
  dob?: string | null;
  gender?: 'male' | 'female' | null;
  createdAt?: string | null;
  status?: 'active' | 'blocked' | null;
  addresses?: Address[];
  notifications?: Notification[];
  wishlist?: Product[];
  cart?: CartItem[];
  returns?: ReturnRequest[];
  savedItems?: Product[];
}

export interface UserProfileWithOrders extends UserProfile {
  orders?: Order[];
}

export interface AdminData {
  orders: Order[];
  users: UserProfileWithOrders[];
  products: Product[];
  invoices: Invoice[];
  promotions: Promotion[];
  subscribers: any[];
  mailTemplates: MailTemplate[];
  contactSubmissions: ContactSubmission[];
  returns: ReturnRequest[];
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          created_at?: string
        }
      },
      returns: {
        Row: {
          id: string
          order_id: string
          item_id: string
          user_id: string
          reason: string | null
          comments: string | null
          type: "refund" | "replacement" | null
          images: Json | null
          status: string | null
          pickup_status: string | null
          inspection_status: string | null
          refund_status: string | null
          refund_amount: number | null
          return_requested_at: string
          updated_at: string
          status_history: Json | null
        }
        Insert: {
          id?: string
          order_id: string
          item_id: string
          user_id: string
          reason?: string | null
          comments?: string | null
          type?: "refund" | "replacement" | null
          images?: Json | null
          status?: string | null
          pickup_status?: string | null
          inspection_status?: string | null
          refund_status?: string | null
          refund_amount?: number | null
          return_requested_at?: string
          updated_at?: string
          status_history?: Json | null
        }
        Update: {
          id?: string
          order_id?: string
          item_id?: string
          user_id?: string
          reason?: string | null
          comments?: string | null
          type?: "refund" | "replacement" | null
          images?: Json | null
          status?: string | null
          pickup_status?: string | null
          inspection_status?: string | null
          refund_status?: string | null
          refund_amount?: number | null
          return_requested_at?: string
          updated_at?: string
          status_history?: Json | null
        }
      },
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_number: string;
          invoice_date: string;
          user_id: string;
          gst_details: Json;
          vendor_info: Json;
          total_amount: number;
          pdf_url: string | null;
          qr_code_url: string | null;
          packet_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_number: string;
          invoice_date?: string;
          user_id: string;
          gst_details: Json;
          vendor_info: Json;
          total_amount: number;
          pdf_url?: string | null;
          qr_code_url?: string | null;
          packet_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          invoice_number?: string;
          invoice_date?: string;
          user_id?: string;
          gst_details?: Json;
          vendor_info?: Json;
          total_amount?: number;
          pdf_url?: string | null;
          qr_code_url?: string | null;
          packet_id?: string | null;
          created_at?: string;
        };
      };
      seasonal_edit_cards: {
        Row: {
          id: string;
          ordering: number;
          card_type: string;
          is_active: boolean;
          image_path: string | null;
          title: string | null;
          description: string | null;
          button_text: string | null;
          button_link: string | null;
          product_id: number | null;
          reverse_layout: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ordering?: number;
          card_type: string;
          is_active?: boolean;
          image_path?: string | null;
          title?: string | null;
          description?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          product_id?: number | null;
          reverse_layout?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ordering?: number;
          card_type?: string;
          is_active?: boolean;
          image_path?: string | null;
          title?: string | null;
          description?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          product_id?: number | null;
          reverse_layout?: boolean;
          created_at?: string;
        };
      };
      mail_templates: {
        Row: {
          id: number
          name: string
          subject: string
          html_content: string
          template_type: string
          placeholders: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          subject: string
          html_content: string
          template_type: string
          placeholders?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          subject?: string
          html_content?: string
          template_type?: string
          placeholders?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          address: string
          city: string
          id: string
          is_default: boolean | null
          locality: string
          mobile: string
          name: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          id?: string
          is_default?: boolean | null
          locality: string
          mobile: string
          name: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          id?: string
          is_default?: boolean | null
          locality?: string
          mobile?: string
          name?: string
          pincode?: string
          state?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          hero_image: string
          id: string
          name: string
          page_hero_media: Json | null
          page_hero_text: string | null
          show_page_hero_text: boolean | null
          app_image_path: string | null
        }
        Insert: {
          hero_image: string
          id: string
          name: string
          page_hero_media?: Json | null
          page_hero_text?: string | null
          show_page_hero_text?: boolean | null
          app_image_path?: string | null
        }
        Update: {
          hero_image?: string
          id?: string
          name?: string
          page_hero_media?: Json | null
          page_hero_text?: string | null
          show_page_hero_text?: boolean | null
          app_image_path?: string | null
        }
      }
      contacts: {
        Row: {
          id: number
          name: string
          email: string
          message: string
          status: 'new' | 'read' | 'resolved'
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: number
          name: string
          email: string
          message: string
          status?: 'new' | 'read' | 'resolved'
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          email?: string
          message?: string
          status?: 'new' | 'read' | 'resolved'
          created_at?: string
          user_id?: string | null
        }
      }
      promotions: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: number
          is_active: boolean
          min_purchase: number
          type: string
          usage_limit: number
          uses: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: number
          is_active?: boolean
          min_purchase?: number
          type: string
          usage_limit?: number
          uses?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: number
          is_active?: boolean
          min_purchase?: number
          type?: string
          usage_limit?: number
          uses?: number
          value?: number
        }
      }
      orders: {
        Row: {
          current_status: string
          id: string
          items: Json
          order_date: string
          payment: Json
          shipping_address: Json
          status_history: Json | null
          total_amount: number
          user_id: string
          promotion_code: string | null
          invoice_number: string | null
          invoice_date: string | null
          gst_details: Json | null
          vendor_info: Json | null
          qr_code_url: string | null
          packet_id: string | null
          downloadable_invoice_url: string | null
          courier_name: string | null
          tracking_id: string | null
          tracking_url: string | null
        }
        Insert: {
          current_status: string
          id: string
          items: Json
          order_date: string
          payment: Json
          shipping_address: Json
          status_history?: Json | null
          total_amount: number
          user_id: string
          promotion_code?: string | null
          invoice_number?: string | null
          invoice_date?: string | null
          gst_details?: Json | null
          vendor_info?: Json | null
          qr_code_url?: string | null
          packet_id?: string | null
          downloadable_invoice_url?: string | null
          courier_name?: string | null
          tracking_id?: string | null
          tracking_url?: string | null
        }
        Update: {
          current_status?: string
          id?: string
          items?: Json
          order_date?: string
          payment?: Json
          shipping_address?: Json
          status_history?: Json | null
          total_amount?: number
          user_id?: string
          promotion_code?: string | null
          invoice_number?: string | null
          invoice_date?: string | null
          gst_details?: Json | null
          vendor_info?: Json | null
          qr_code_url?: string | null
          packet_id?: string | null
          downloadable_invoice_url?: string | null
          courier_name?: string | null
          tracking_id?: string | null
          tracking_url?: string | null
        }
      }
      pending_changes: {
        Row: {
          author_name: string
          data: Json | null
          description: string
          id: string
          status: string
          timestamp: string
          type: string
        }
        Insert: {
          author_name: string
          data?: Json | null
          description: string
          id?: string
          status: string
          timestamp: string
          type: string
        }
        Update: {
          author_name?: string
          data?: Json | null
          description?: string
          id?: string
          status?: string
          timestamp?: string
          type?: string
        }
      }
      products: {
        Row: {
          category: string
          colors: Json
          created_at: string
          description: string
          hsn_code: string | null
          id: number
          images: string[]
          mrp: number
          name: string
          price: number
          rating: number
          reviews: number
          sizes: string[]
          specifications: Json
          uuid: string
        }
        Insert: {
          category: string
          colors: Json
          created_at?: string
          description: string
          hsn_code?: string | null
          id?: number
          images: string[]
          mrp: number
          name: string
          price: number
          rating: number
          reviews: number
          sizes: string[]
          specifications: Json
          uuid: string
        }
        Update: {
          category?: string
          colors?: Json
          created_at?: string
          description?: string
          hsn_code?: string | null
          id?: number
          images?: string[]
          mrp?: number
          name?: string
          price?: number
          rating?: number
          reviews?: number
          sizes?: string[]
          specifications?: Json
          uuid?: string
        }
      }
      profiles: {
        Row: {
          avatar: string | null
          cart: Json | null
          dob: string | null
          email: string | null
          gender: string | null
          id: string
          mobile: string | null
          name: string
          notifications: Json | null
          created_at: string | null
          role: string | null
          status: string | null
          wishlist: Json | null
          saved_items: Json | null
        }
        Insert: {
          avatar?: string | null
          cart?: Json | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id: string
          mobile?: string | null
          name: string
          notifications?: Json | null
          created_at?: string | null
          role?: string | null
          status?: string | null
          wishlist?: Json | null
          saved_items?: Json | null
        }
        Update: {
          avatar?: string | null
          cart?: Json | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          mobile?: string | null
          name?: string
          notifications?: Json | null
          created_at?: string | null
          role?: string | null
          status?: string | null
          wishlist?: Json | null
          saved_items?: Json | null
        }
      }
      reviews: {
        Row: {
          author: string
          comment: string
          date: string
          id: number
          product_id: number
          product_images: string[]
          rating: number
          status: string
          user_id: string | null
          user_image: string
        }
        Insert: {
          author: string
          comment: string
          date: string
          id?: number
          product_id: number
          product_images: string[]
          rating: number
          status: string
          user_id?: string | null
          user_image: string
        }
        Update: {
          author?: string
          comment?: string
          date?: string
          id?: number
          product_id?: number
          product_images?: string[]
          rating?: number
          status?: string
          user_id?: string | null
          user_image?: string
        }
      }
      slides: {
        Row: {
          id: string
          media: Json | null
          ordering: number | null
          text: string
          show_text: boolean
        }
        Insert: {
          id: string
          media?: Json | null
          ordering?: number | null
          text: string
          show_text?: boolean
        }
        Update: {
          id?: string
          media?: Json | null
          ordering?: number | null
          text?: string
          show_text?: boolean
        }
      }
      subscribers: {
        Row: {
          id: number
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: number
          email: string
          subscribed_at?: string
        }
        Update: {
          id?: number
          email?: string
          subscribed_at?: string
        }
      }
      site_content: {
        Row: {
          id: string
          data: Json
        }
        Insert: {
          id: string
          data: Json
        }
        Update: {
          id?: string
          data?: Json
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}