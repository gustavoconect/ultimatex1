# Guia de Configuração: Discord Auth

Para que o login funcione, você precisa conectar o Supabase ao Discord seguindo estes passos exatos.

## Passo 1: Criar App no Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em **"New Application"** (Canto superior direito).
3. Dê um nome (ex: "Ultimate X1 Manager") e aceite.
4. No menu lateral, clique em **OAuth2**.
5. Copie o **Client ID**.
6. Clique em "Reset Secret" para gerar e copiar o **Client Secret**.
   > **⚠️ IMPORTANTE:** Guarde esses dois códigos. Você vai usá-los no Supabase.

## Passo 2: Configurar Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **Authentication** (ícone de usuários) > **Providers**.
3. Selecione **Discord** na lista e habilite-o ("Enable Discord").
4. Cole o **Client ID** e o **Client Secret** que você copiou no passo anterior.
5. Copie a URL que aparece em "Callback URL (for Discord)".
   - Deve ser algo como: `https://swkzzzzzzzz.supabase.co/auth/v1/callback`
6. Clique em **Save**.

## Passo 3: Finalizar no Discord

1. Volte ao [Discord Developer Portal](https://discord.com/developers/applications) > **OAuth2**.
2. Role até **"Redirects"**.
3. Clique em "Add Redirect".
4. Cole a **Callback URL** que você copiou do Supabase (passo 2.5).
   - Exemplo: `https://swkzzzzzzzz.supabase.co/auth/v1/callback`
5. Clique em **Save Changes** lá embaixo.

## Passo 4: Configurar Redirecionamento Local (Supabase)

1. No Supabase Dashboard, vá em **Authentication** > **URL Configuration**.
2. Em **Site URL**, coloque: `http://localhost:3000`.
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. Clique em **Save**.

## Passo 5: Variáveis de Ambiente

Garanta que seu arquivo `.env.local` na pasta `ultimate-x1` tenha as chaves corretas do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-longa"
```

---

✅ **Pronto!** Agora reinicie o servidor (`npm run dev`) e tente fazer login novamente.
