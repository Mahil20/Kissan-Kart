import { createClient } from '@supabase/supabase-js';

// Fresh Supabase configuration
const supabaseUrl = "https://nuubqqarsppmhetzqoml.supabase.co";

// This is the public anon key - safe to expose in frontend
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dWJxcWFyc3BwbWhldHpxb21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDc3MjAsImV4cCI6MjA3NDQ4MzcyMH0.Q0PD_w5PU8CvTVniuEEv5a29TtoW0HXYgpNvn06e4Ac";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
