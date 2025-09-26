// Simple test to check Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fxdeecqfkabeqsihspyo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGVlY3Fma2FiZXFzaWhzcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NjgzMzAsImV4cCI6MjA1MzQ0NDMzMH0.BcY6FrW2kq1KZsOMJG2oGOVMnEP5Fks8j_RkOD7W0oY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test with a simple query
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection test failed:', error);
    } else {
      console.log('Connection successful!');
    }
    
    // Test auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
    });
    
    if (authError) {
      console.error('Auth test error:', authError);
    } else {
      console.log('Auth connection working');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();
