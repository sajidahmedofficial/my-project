// agent-notes: { ctx: "Supabase client initialization for authentication & data storage with session detection enabled", deps: ["@supabase/supabase-js"], state: "active", last: "sato@2026-09-23" }
 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkktmjgzfuoymdvgdhda.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJra3Rtamd6ZnVveW1kdmdkaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY4NzEsImV4cCI6MjA5OTgzMjg3MX0.t6f10I9DQMcmvVmyupDyxxA-hg3Jer15D3wLnHqXpPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase session check notice:', error.message);
      return { connected: false, isDnsError: false, error: error.message };
    }
    return { connected: true, isDnsError: false, session: data?.session };
  } catch (err) {
    const isDns = err.code === 'ENOTFOUND' || err.message?.includes('fetch failed') || err.message?.includes('Failed to fetch');
    return { 
      connected: false, 
      isDnsError: isDns, 
      error: isDns 
        ? 'Remote Supabase host is currently unreachable over DNS. Active local storage fallback is operational.' 
        : err.message 
    };
  }
}
