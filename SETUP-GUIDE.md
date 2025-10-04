# Supabase Authentication Setup Guide

This guide will help you set up and test the complete authentication system for the Kissan-Kart application.

## 🚀 Quick Start

### 1. Environment Setup

The `.env` file is already configured with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://fxdeecqfkabeqsihspyo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Supabase Project Configuration

Your Supabase project needs the following configuration:

#### Email Authentication Settings
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select project: `fxdeecqfkabeqsihspyo`
3. Navigate to **Authentication > Providers**
4. Enable **Email** provider
5. Configure email settings:
   - ✅ Enable email confirmations (recommended for production)
   - ✅ OR disable email confirmations (for testing only)

#### Database Schema
Create a `profiles` table to store user data:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testing Authentication

### Method 1: Using the Test HTML File

1. Open `test-auth.html` in your browser
2. Test the following flows:
   - **Connection Status**: Should show "Connected to Supabase"
   - **Sign Up**: Create a test account
   - **Sign In**: Login with the test account
   - **Session Check**: Verify session persistence
   - **Sign Out**: Logout functionality

### Method 2: Using the React Application

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `/auth` route
3. Test the authentication flows:
   - Sign up with a new account
   - Verify email (if confirmations are enabled)
   - Sign in with credentials
   - Navigate to protected routes
   - Test logout

### Method 3: Manual Supabase Testing

```javascript
import { supabase } from '@/lib/supabase-client';

// Test sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: {
      role: 'user',
      full_name: 'Test User'
    }
  }
});

// Test sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});

// Check session
const { data: { session } } = await supabase.auth.getSession();

// Sign out
await supabase.auth.signOut();
```

## ✅ Authentication Features Implemented

### 1. Sign Up (`useAuth.signUp`)
- ✅ Email/password registration
- ✅ Role-based signup (user, vendor, admin)
- ✅ User metadata storage
- ✅ Profile creation via database trigger
- ✅ Email confirmation support
- ✅ Error handling with toast notifications
- ✅ Network status checking

### 2. Sign In (`useAuth.signIn`)
- ✅ Email/password authentication
- ✅ Session management
- ✅ Role-based redirection
- ✅ Email confirmation validation
- ✅ Error handling with toast notifications
- ✅ Auto profile data fetch

### 3. Sign Out (`useAuth.signOut`)
- ✅ Session termination
- ✅ State cleanup
- ✅ Redirect to home page
- ✅ Error handling

### 4. Session Management
- ✅ Automatic session restoration on page load
- ✅ Session persistence in localStorage
- ✅ Real-time auth state changes
- ✅ Session refresh mechanism
- ✅ Profile data synchronization

### 5. Protected Routes
- ✅ `ProtectedRoute` component
- ✅ Role-based access control
- ✅ Automatic redirect to login
- ✅ Loading states
- ✅ Support for: user, vendor, admin, pending_vendor roles

### 6. User Profile Integration
- ✅ Profile data fetching
- ✅ Merging session user with profile data
- ✅ Role checking (metadata + profile)
- ✅ Profile refresh functionality
- ✅ Computed role flags (isAdmin, isVendor, isPendingVendor)

## 🔧 Configuration Files

### Updated Files:
1. ✅ `src/hooks/useAuth.tsx` - Main authentication hook with fixed Supabase v2 API calls
2. ✅ `src/lib/supabase-client.ts` - Supabase client with environment variables
3. ✅ `src/components/Auth/AuthForm.tsx` - Sign up/sign in forms
4. ✅ `src/components/Auth/ProtectedRoute.tsx` - Route protection
5. ✅ `src/App.tsx` - Auth provider integration

## 📝 Testing Checklist

- [ ] **Supabase Connection**: Open test-auth.html and verify connection
- [ ] **Sign Up Flow**:
  - [ ] Create new user account
  - [ ] Verify email sent (if enabled)
  - [ ] Check profile created in database
- [ ] **Sign In Flow**:
  - [ ] Login with valid credentials
  - [ ] Login with invalid credentials (should fail)
  - [ ] Login before email confirmation (should handle appropriately)
- [ ] **Session Persistence**:
  - [ ] Login and refresh page
  - [ ] Session should persist
  - [ ] User data should load automatically
- [ ] **Sign Out Flow**:
  - [ ] Logout functionality
  - [ ] Session cleared
  - [ ] Redirect to home page
- [ ] **Protected Routes**:
  - [ ] Access /profile (requires authentication)
  - [ ] Access /vendor/dashboard (requires vendor role)
  - [ ] Access /admin (requires admin role)
- [ ] **Role-Based Access**:
  - [ ] User role can access user routes
  - [ ] Vendor role can access vendor routes
  - [ ] Admin role can access admin routes

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or Network errors
**Solution**: 
- Check internet connection
- Verify Supabase project URL is correct
- Check if Supabase project is active

### Issue: "Invalid API key"
**Solution**: 
- Verify VITE_SUPABASE_ANON_KEY in .env file
- Get fresh anon key from Supabase dashboard > Settings > API

### Issue: Email confirmations not working
**Solution**: 
- Check Supabase dashboard > Authentication > Email Templates
- Verify email provider is configured
- For testing, disable email confirmations temporarily

### Issue: Profile not created
**Solution**: 
- Run the SQL trigger creation script above
- Check Supabase dashboard > Database > Tables
- Verify profiles table exists

### Issue: Role not set correctly
**Solution**: 
- Check user_metadata in Supabase dashboard > Authentication > Users
- Verify profile.role in profiles table
- Use `refreshUserData()` to sync roles

## 🎯 Next Steps

1. **Configure Email Templates** in Supabase for better user experience
2. **Set up Password Reset** functionality
3. **Add OAuth providers** (Google, GitHub, etc.)
4. **Implement Profile Management** page
5. **Add Role Change Workflows** (e.g., user → vendor upgrade)
6. **Set up Notifications** system
7. **Configure RLS policies** for other tables (vendors, products, etc.)

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
