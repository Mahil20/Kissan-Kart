// Mock authentication system for testing when Supabase is not available

interface MockUser {
  id: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  full_name: string;
  created_at: string;
}

// Store users in localStorage for persistence
const USERS_KEY = 'mock_users';
const SESSION_KEY = 'mock_session';

// Compatible UUID generator for all browsers
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class MockAuth {
  private users: MockUser[] = [];
  private currentUser: MockUser | null = null;

  constructor() {
    this.loadUsers();
    this.loadSession();
  }

  private loadUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      this.users = JSON.parse(stored);
    }
  }

  private saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }

  private loadSession() {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  private saveSession(user: MockUser | null) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    this.currentUser = user;
  }

  async signUp(email: string, password: string, role: 'user' | 'vendor' | 'admin' = 'user') {
    console.log('MockAuth: Starting signup for', email);
    
    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: MockUser = {
      id: generateUUID(),
      email,
      role,
      full_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    this.saveSession(newUser);

    console.log('MockAuth: Signup successful for', email);

    return {
      data: {
        user: newUser,
        session: { user: newUser, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signIn(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.saveSession(user);

    return {
      data: {
        user,
        session: { user, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signOut() {
    this.saveSession(null);
    return { error: null };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSession() {
    return {
      data: {
        session: this.currentUser ? 
          { user: this.currentUser, access_token: 'mock_token' } : 
          null
      },
      error: null
    };
  }

  // Auth state change callback (simplified)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // For demo purposes, just call immediately with current state
    const session = this.currentUser ? 
      { user: this.currentUser, access_token: 'mock_token' } : 
      null;
    
    setTimeout(() => callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session), 100);
    
    return {
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    };
  }
}

export const mockAuth = new MockAuth();
