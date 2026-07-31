// agent-notes: { ctx: "Supabase client initialization for authentication & data storage", deps: ["@supabase/supabase-js"], state: "active", last: "anti@2026-07-31" }

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkktmjgzfuoymdvgdhda.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJra3Rtamd6ZnVveW1kdmdkaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY4NzEsImV4cCI6MjA5OTgzMjg3MX0.t6f10I9DQMcmvVmyupDyxxA-hg3Jer15D3wLnHqXpPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
