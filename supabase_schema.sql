-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE PARA ATUALIZAR O BANCO

-- 1. Tabela Players (Garante colunas necessárias)
CREATE TABLE IF NOT EXISTS public.players (
    name text PRIMARY KEY,
    elo text DEFAULT 'Ferro IV',
    pdl integer DEFAULT 0,
    wins integer DEFAULT 0,
    losses integer DEFAULT 0,
    history jsonb DEFAULT '[]'::jsonb
);

-- 2. Tabela Match History (Recriada para suportar JSON completo do jogo)
DROP TABLE IF EXISTS public.match_history;
CREATE TABLE public.match_history (
    id bigint PRIMARY KEY, -- ID do jogo (1, 2, 3...)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    data jsonb NOT NULL -- Aqui salvamos o objeto completo do jogo (players, picks, etc)
);

-- 3. Tabela Blacklist
CREATE TABLE IF NOT EXISTS public.blacklist (
    name text PRIMARY KEY,
    image text
);

-- HABILITAR RLS (Segurança) mas chaves de serviço ignoram
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS (Permitir leitura pública se quiser, escrita bloqueada sem chave)
CREATE POLICY "Public Read Players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public Read History" ON public.match_history FOR SELECT USING (true);
CREATE POLICY "Public Read Blacklist" ON public.blacklist FOR SELECT USING (true);
