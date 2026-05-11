import { createClient } from '@supabase/supabase-js';

// Grab our secret keys from the .env file we just made
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This is the main connection point our app will use to talk to the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 