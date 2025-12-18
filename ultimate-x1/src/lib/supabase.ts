import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client para uso no frontend (Browser) - Gerencia Cookies/PKCE automaticamente
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Client para uso no backend (Admin/Service Role)
// Usamos createClient do supabase-js pois aqui não precisamos de fluxo de cookies de sessão
// e sim acesso direto ao banco com chave de serviço.
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : createClient(supabaseUrl, supabaseAnonKey);
