import { createClient } from '@supabase/supabase-js';

export async function getAuthenticatedSupabase(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { client: null, user: null, error: 'Supabase not configured', status: 500 };
  }

  if (!token) {
    return { client: null, user: null, error: 'Authentication required', status: 401 };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await client.auth.getUser(token);

  if (error || !user) {
    return { client: null, user: null, error: 'Invalid or expired session', status: 401 };
  }

  return { client, user, error: null, status: 200 };
}