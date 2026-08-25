// agent-notes: { ctx: "Backend Supabase client & sync service for user progress, verified skills & certificates", deps: ["@supabase/supabase-js"], state: "active", last: "anti@2026-08-25" }
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://rkktmjgzfuoymdvgdhda.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJra3Rtamd6ZnVveW1kdmdkaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY4NzEsImV4cCI6MjA5OTgzMjg3MX0.t6f10I9DQMcmvVmyupDyxxA-hg3Jer15D3wLnHqXpPg';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export async function checkSupabaseConnection() {
  if (!supabase) return { connected: false, error: 'Supabase credentials not configured' };
  try {
    const { error } = await supabase.from('user_progress').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { connected: true, status: 'CONNECTED_AUTH', message: error.message };
    }
    return { connected: true, status: 'CONNECTED' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export default {
  supabase,
  checkSupabaseConnection
};
