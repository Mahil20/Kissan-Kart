


import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { UserProfile, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: (User & Partial<UserProfile>) | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  isPendingVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<(User & Partial<UserProfile>) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profileData) => {
          if (profileData) {
            setUser({
              ...session.user,
              ...profileData
            } as User & Partial<UserProfile>);
          } else {
            setUser(session.user as User & Partial<UserProfile>);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setUser({
              ...session.user,
              ...profileData
            } as User & Partial<UserProfile>);
          } else {
            setUser(session.user as User & Partial<UserProfile>);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  const refreshUserData = async () => {
    try {
      setLoading(true);
      
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (session?.user) {
        await supabase.auth.refreshSession();
        
        const profileData = await fetchUserProfile(session.user.id);
        
        const { data: refreshData } = await supabase.auth.getSession();
        const refreshedSession = refreshData.session;
        
        setSession(refreshedSession);
        
        if (profileData && refreshedSession?.user) {
          const updatedUser = {
            ...refreshedSession.user,
            ...profileData
          } as User & Partial<UserProfile>;
          
          console.log('User data refreshed:', { 
            id: updatedUser.id,
            metadataRole: updatedUser.user_metadata?.role, 
            profileRole: updatedUser.role
          });
          
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to sign in with:', { email });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please check your internet connection and Supabase configuration')), 30000)
      );
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.id);
      toast.success('Signed in successfully');
      
      const userRole = data.user?.user_metadata?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const err = error instanceof Error ? error : new Error('Unknown sign in error');
      setError(err);
      
      if (err.message.includes('timeout') || err.message.includes('Failed to fetch')) {
        toast.error('Connection error. Please check: 1) Internet connection, 2) Supabase credentials in .env file');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting signup process...', { email, role });
      
      if (!navigator.onLine) {
        throw new Error('Network error: You appear to be offline. Please check your internet connection and try again.');
      }
      
      console.log('Network check passed, calling Supabase...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please check your internet connection and Supabase configuration')), 30000)
      );
      
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: email.split('@')[0]
          }
        }
      });
      
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      
      console.log('Sign up successful, verification email sent');
      toast.success('Signed up successfully! Please check your email for confirmation.');
      toast.info('You must confirm your email before you can sign in.');
      
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown sign up error');
      setError(errorObj);
      
      if (errorObj.message.includes('Failed to fetch') || errorObj.message.includes('Network') || errorObj.message.includes('timeout')) {
        toast.error('Connection error. Please check: 1) Internet connection, 2) Supabase credentials in .env file');
      } else {
        toast.error(errorObj.message || 'Failed to sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown sign out error');
      setError(errorObj);
      toast.error(errorObj.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = useMemo(() => {
    const fromMetadata = user?.user_metadata?.role === 'admin';
    const fromProfile = user?.role === 'admin';
    return Boolean(fromMetadata || fromProfile);
  }, [user]);

  const isVendor = useMemo(() => (
    Boolean(user?.user_metadata?.role === 'vendor' || user?.role === 'vendor')
  ), [user]);

  const isPendingVendor = useMemo(() => (
    Boolean(user?.user_metadata?.role === 'pending_vendor' || user?.role === 'pending_vendor')
  ), [user]);

  useEffect(() => {
    if (user) {
      console.log('AUTH DEBUG - User role information:', { 
        id: user.id,
        email: user.email,
        metadataRole: user.user_metadata?.role, 
        profileRole: user.role,
        isAdminComputed: isAdmin,
        isVendorComputed: isVendor,
        isPendingVendorComputed: isPendingVendor
      });
    }
  }, [user, isAdmin, isVendor, isPendingVendor]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshUserData,
        isAdmin,
        isVendor,
        isPendingVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
