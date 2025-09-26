import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Vendor, Product, UserProfile } from '@/types';

// Hardcoded Supabase configuration for direct project usage
const supabaseUrl = "https://fxdeecqfkabeqsihspyo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGVlY3Fma2FiZXFzaWhzcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NjgzMzAsImV4cCI6MjA1MzQ0NDMzMH0.BcY6FrW2kq1KZsOMJG2oGOVMnEP5Fks8j_RkOD7W0oY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, role: 'user' | 'vendor' | 'admin' = 'user') => {
  try {
    // Extract name from email for default display name
    const defaultName = email.split('@')[0];
    const displayName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: displayName,
        },
      },
    });
    
    if (error) throw error;
    
    // Try to create profile record, but don't fail if table doesn't exist
    if (data.user) {
      try {
        const profileData = {
          id: data.user.id,
          email: email,
          full_name: displayName,
          role: role,
          created_at: new Date().toISOString(),
          // Add role-specific default settings
          preferences: role === 'vendor' ? 
            { showInMap: true, allowContactByEmail: true } : 
            { language: 'english', notifications: true }
        };
        
        await supabase.from('profiles').insert(profileData);
        console.log('Profile created successfully');
      } catch (profileError) {
        console.warn('Could not create profile record (this is okay for testing):', profileError);
        // Don't throw here - auth signup was successful
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error during sign in:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error during sign out:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      return { 
        user: {
          ...data.user,
          ...profile
        }, 
        error: null 
      };
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};

// User profile helpers
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Profile updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Show error toast
    toast.error('Failed to update profile');
    return { data: null, error };
  }
};

// Vendor helpers
export const getVendors = async (limit = 20, filter?: string) => {
  try {
    // First get the vendors
    let query = supabase
      .from('vendors')
      .select('*');
      
    if (filter === 'verified') {
      query = query.eq('verification_status', 'verified');
    } else if (filter === 'pending') {
      query = query.eq('verification_status', 'pending');
    } else if (filter === 'rejected') {
      query = query.eq('verification_status', 'rejected');
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data: vendors, error } = await query;
    
    if (error) throw error;
    
    if (!vendors || vendors.length === 0) {
      return { data: [], error: null };
    }
    
    // For each vendor, fetch their products
    const vendorsWithProducts = await Promise.all(
      vendors.map(async (vendor) => {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendor.id);
          
        return {
          ...vendor,
          products: products || []
        };
      })
    );
    
    return { data: vendorsWithProducts, error: null };
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return { data: [], error };
  }
};

export const getVendorsByLocation = async (lat: number, lng: number, radiusKm = 10) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verification_status', 'verified');
    
    if (error) throw error;
    
    // Filter by distance on the client side (simplified)
    // In production, this would be better done in the database with PostGIS
    const filteredVendors = data?.filter(vendor => {
      if (!vendor.location) return false;
      const distance = calculateDistance(
        lat, lng, 
        vendor.location.lat, vendor.location.lng
      );
      return distance <= radiusKm;
    });
    
    return { data: filteredVendors, error: null };
  } catch (error) {
    console.error('Error fetching vendors by location:', error);
    return { data: null, error };
  }
};

// Simple haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

export const getVendorById = async (id: string) => {
  try {
    // First fetch the vendor data
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (vendorError) throw vendorError;
    
    // Then fetch the products for this vendor
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', id);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      // Continue even if products fetch fails
    }
    
    // Combine vendor data with products
    const vendorWithProducts = {
      ...vendorData,
      products: productsData || []
    };
    
    console.log(`Fetched vendor ${id} with ${productsData?.length || 0} products`);
    return { data: vendorWithProducts, error: null };
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    return { data: null, error };
  }
};

export const createVendor = async (vendorData: Partial<Vendor>) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Vendor created successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error creating vendor:', error);
    // Show error toast
    toast.error('Failed to create vendor');
    return { data: null, error };
  }
};

export const updateVendor = async (id: string, updates: Partial<Vendor>) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Vendor updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error updating vendor:', error);
    // Show error toast
    toast.error('Failed to update vendor');
    return { data: null, error };
  }
};

// Product helpers
export const getProducts = async (vendorId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Product added successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error creating product:', error);
    // Show error toast
    toast.error('Failed to add product');
    return { data: null, error };
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Product updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error updating product:', error);
    // Show error toast
    toast.error('Failed to update product');
    return { data: null, error };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // Show success toast
    toast.success('Product deleted successfully');
    return { error: null };
  } catch (error) {
    console.error('Error deleting product:', error);
    // Show error toast
    toast.error('Failed to delete product');
    return { error };
  }
};

// Admin notification system
// Admin notification functions
export const createAdminNotification = async (type: string, message: string, data: Record<string, unknown>) => {
  try {
    // First, find all admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');
      
    if (adminError) throw adminError;
    
    if (!adminUsers || adminUsers.length === 0) {
      console.warn('No admin users found to notify');
      return { success: false, error: 'No admin users found' };
    }
    
    // Create notifications for each admin
    const notifications = adminUsers.map(admin => ({
      user_id: admin.id,
      type,
      message,
      data,
      is_read: false,
      created_at: new Date().toISOString()
    }));
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);
      
    if (notificationError) throw notificationError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return { success: false, error };
  }
};

// Create notification for a specific user (e.g., vendor)
export const createUserNotification = async (userId: string, type: string, message: string, data: Record<string, unknown> = {}) => {
  try {
    const notification = {
      user_id: userId,
      type,
      message,
      data,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating user notification:', error);
    return { success: false, error };
  }
};

export const getAdminNotifications = async (userId: string) => {
  try {
    console.log('Fetching notifications for admin user:', userId);
    
    // First check if the notifications table exists
    const { error: tableCheckError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
      
    // If there's an error like table doesn't exist, return empty array
    if (tableCheckError) {
      console.log('Notifications table may not exist:', tableCheckError.message);
      return { data: [], error: null };
    }
    
    // If table exists, fetch notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    // Return empty array instead of null to prevent further errors
    return { data: [], error };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

// Admin helpers
export const getPendingVendors = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    return { data: [], error };
  }
};

export const updateVendorVerification = async (id: string, status: 'pending' | 'verified' | 'rejected') => {
  try {
    console.log(`Updating vendor ${id} status to ${status}`);
    
    // First get the vendor to find the owner_id and name
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (vendorError) {
      console.error('Error fetching vendor:', vendorError);
      throw new Error(`Failed to fetch vendor: ${vendorError.message}`);
    }
    
    if (!vendor) {
      console.error('Vendor not found with ID:', id);
      throw new Error('Vendor not found');
    }
    
    console.log(`Found vendor: ${vendor.name} with owner ID: ${vendor.owner_id}`);
    
    // Update the vendor verification status
    // Only update the verification_status field, verified_at doesn't exist in the schema
    const { data, error } = await supabase
      .from('vendors')
      .update({ verification_status: status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating vendor status:', error);
      throw new Error(`Failed to update vendor status: ${error.message}`);
    }
    
    console.log('Vendor status updated successfully');
    
    // Only update profile if status is changing to verified or rejected
    if (vendor?.owner_id && (status === 'verified' || status === 'rejected')) {
      // Set the new role based on status
      const newRole = status === 'verified' ? 'vendor' : 'user';
      console.log(`Setting user ${vendor.owner_id} role to ${newRole}`);
      
      try {
        // Update profile role with updated_at timestamp
        console.log(`Updating profile for user ${vendor.owner_id} to role: ${newRole}`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', vendor.owner_id);
          
        if (profileError) {
          console.error('Error updating user profile role:', profileError);
          // Continue even if profile update fails
        } else {
          console.log(`Successfully updated profile role to ${newRole}`);
        }
      } catch (profileUpdateError) {
        console.error('Exception during profile update:', profileUpdateError);
        // Continue even if profile update fails
      }
      
      // Simplify auth metadata update
      try {
        console.log(`Updating auth metadata for user ${vendor.owner_id} to role: ${newRole}`);
        const { error: authError } = await supabase.auth.updateUser({
          data: { role: newRole }
        });
        
        if (authError) {
          console.error('Error updating user auth metadata:', authError);
        } else {
          console.log('Successfully updated auth metadata');
        }
      } catch (authUpdateError) {
        console.error('Exception during auth metadata update:', authUpdateError);
        // Continue even if auth update fails
      }
      
      // Send notification to the vendor about their application status
      if (status === 'verified') {
        await createUserNotification(
          vendor.owner_id,
          'vendor_approved',
          `Congratulations! Your vendor application for ${vendor.name} has been approved. You can now access your vendor dashboard and start selling your products.`,
          { vendorId: id, status }
        );
      } else if (status === 'rejected') {
        await createUserNotification(
          vendor.owner_id,
          'vendor_rejected',
          `Your vendor application for ${vendor.name} has been rejected. Please contact support for more information or submit a new application with updated information.`,
          { vendorId: id, status }
        );
      }
    }
    
    // Show success toast
    toast.success(`Vendor ${status === 'verified' ? 'approved' : status} successfully`);
    return { data, error: null };
  } catch (error: unknown) {
    console.error('Error updating vendor verification:', error);
    // Show error toast with specific message
    const errorMessage = error instanceof Error ? error.message : 'Failed to update vendor status';
    toast.error(errorMessage);
    return { data: null, error };
  }
};

// File upload helpers
export const uploadImage = async (filePath: string, file: File) => {
  try {
    // Check if bucket exists, if not, create a fallback path
    let bucketName = 'vendor-documents';
    
    // First check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // If bucket doesn't exist, use a default bucket
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' not found, using default bucket`);
      bucketName = 'images'; // Fallback to default bucket
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
      
    return { url: publicURL.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    // For debugging, log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return { url: null, error };
  }
};

// Favorites system
export const toggleFavoriteVendor = async (userId: string, vendorId: string) => {
  try {
    // First, get the current favorites
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // If no favorites array, create one
    let favorites = profile?.favorites || [];
    
    // Toggle the vendor in favorites
    if (favorites.includes(vendorId)) {
      favorites = favorites.filter(id => id !== vendorId);
    } else {
      favorites.push(vendorId);
    }
    
    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ favorites })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Update was successful
    const action = favorites.includes(vendorId) ? 'added to' : 'removed from';
    toast.success(`Vendor ${action} favorites`);
    
    return { favorites, error: null };
  } catch (error) {
    console.error('Error toggling favorite vendor:', error);
    toast.error('Failed to update favorites');
    return { favorites: null, error };
  }
};

export const getFavoriteVendors = async (userId: string) => {
  try {
    // First get the user's favorites list
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const favorites = profile?.favorites || [];
    
    // If no favorites, return empty array
    if (favorites.length === 0) {
      return { data: [], error: null };
    }
    
    // Fetch all favorite vendors
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .in('id', favorites);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching favorite vendors:', error);
    return { data: null, error };
  }
};
