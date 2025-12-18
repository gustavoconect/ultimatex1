import { NextResponse } from "next/server";

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const issues = [];

    // Validate URL Format
    if (!supabaseUrl) issues.push("NEXT_PUBLIC_SUPABASE_URL is missing");
    else {
        if (supabaseUrl.trim() !== supabaseUrl) issues.push("URL has leading/trailing spaces");
        if (supabaseUrl.includes(" ")) issues.push("URL contains spaces");
        if (!supabaseUrl.startsWith("https://")) issues.push("URL missing https:// protocol");
        if (supabaseUrl.endsWith("/")) issues.push("URL has trailing slash (remove it)");
    }

    // Validate Key Format
    if (!supabaseKey) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
    else {
        if (supabaseKey.trim() !== supabaseKey) issues.push("ANON KEY has leading/trailing spaces");
        if (supabaseKey.includes(" ")) issues.push("ANON KEY contains spaces");
    }

    const results = {
        env: {
            url_length: supabaseUrl.length,
            key_length: supabaseKey.length,
            issues
        },
        tests: {} as Record<string, any>
    };

    if (issues.length === 0) {
        try {
            // Test 1: Health Check (Auth)
            const start = Date.now();
            const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
                method: 'GET',
                headers: {
                    'apikey': supabaseKey
                }
            });
            const duration = Date.now() - start;

            results.tests.auth_health_with_key = {
                status: healthRes.status,
                ok: healthRes.ok,
                duration: `${duration}ms`,
                response: await healthRes.text().catch(e => "Failed to read text")
            };
        } catch (error: any) {
            results.tests.auth_health_error = {
                message: error.message,
                cause: String(error.cause)
            };
        }
    }

    return NextResponse.json(results);
}
