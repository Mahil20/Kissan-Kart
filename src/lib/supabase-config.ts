import { createClient } from '@supabase/supabase-js';

// Fresh Supabase configuration
const supabaseUrl = "https://fxdeecqfkabeqsihspyo.supabase.co";

// This is the public anon key - safe to expose in frontend
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZGVlY3Fma2FiZXFzaWhzcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTQwNTYsImV4cCI6MjA1MzQ3MDA1Nn0.wZ8YjKz9rLpQXeN5vH7uI2A6-kM3dS1fG8cP4xR0Y9T";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
