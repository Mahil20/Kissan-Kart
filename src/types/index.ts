
export type UserRole = 'user' | 'vendor' | 'admin' | 'pending_vendor';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
  favorites?: string[];
}

export interface VendorLocation {
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  image_url?: string;
  stock: number;
  category?: string;
}

export interface Vendor {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: VendorLocation;
  address?: string;
  pin_code?: string;
  products?: Product[];
  products_json?: string; // Added to support JSON string format for products
  contact_phone?: string;
  contact_email?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  banner_image?: string;
  profile_image?: string;
  id_proof_url?: string; // URL to the vendor's ID proof document
  application_date?: string; // Date when vendor application was submitted
  verified_at?: string; // Date when vendor was verified
  opening_hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
