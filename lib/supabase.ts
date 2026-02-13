
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

console.log("[Supabase] Init: ", { url: supabaseUrl ? 'OK' : 'MISSING', key: supabaseAnonKey ? 'OK' : 'MISSING' });

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true
    },
    global: {
        fetch: (url, options) => globalThis.fetch(url, options)
    }
});
