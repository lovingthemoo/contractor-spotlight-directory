
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjceenmkqpyjntndqikg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqY2Vlbm1rcXB5am50bmRxaWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDg3OTUsImV4cCI6MjA1NTEyNDc5NX0._nmqkD-wyahe42Q2gkVHqn_d3z0j5tXZzmtfZqt-BcQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'london-contractors-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    cookieOptions: {
      name: 'london-contractors-session',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: window.location.hostname,
      sameSite: 'Lax',
      path: '/',
      secure: window.location.protocol === 'https:'
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'london-contractors',
    },
  },
});
