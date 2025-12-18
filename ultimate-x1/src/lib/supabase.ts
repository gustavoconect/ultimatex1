import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client para uso no frontend (com RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client para uso no backend (ignora RLS)
// Só criar se tiver a service key (servidor), senão usa o cliente normal (cliente)
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase;
