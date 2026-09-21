// agent-notes: { ctx: "Supabase client initialization for authentication & data storage with connection health check", deps: ["@supabase/supabase-js"], state: "active", last: "anti@2026-08-30" }

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smkumtajiuxmaogfbtnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QNh1KZSNo1tvF2GmM-YjiQ_5-gXDiGn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase session check error:', error.message);
      return { connected: false, error: error.message };
    }
    console.log('Supabase connection verified successfully.');
    return { connected: true, session: data?.session };
  } catch (err) {
    console.warn('Supabase connection attempt failed:', err.message);
    return { connected: false, error: err.message };
  }
}
