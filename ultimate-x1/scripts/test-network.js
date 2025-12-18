require('dotenv').config({ path: '.env.local' });


const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log(`Testando conexão com: ${url}`);

if (!url) {
    console.error("ERRO: URL não encontrada no .env.local");
    process.exit(1);
}

// Teste IPv4 explícito
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

(async () => {
    try {
        console.log("Tentando fetch...");
        const start = Date.now();
        const res = await fetch(`${url}/auth/v1/health`);
        console.log(`Sucesso! Status: ${res.status} (${Date.now() - start}ms)`);
    } catch (e) {
        console.error("ERRO FETCH:", e.message);
        console.error("Causa:", e.cause);
    }
})();
