"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <>
            <p className="text-gray-400 mb-4">
                Não foi possível verificar sua conta Discord.
            </p>

            {error && (
                <div className="bg-red-950/30 border border-red-900/50 p-3 rounded mb-6">
                    <p className="text-xs text-red-500 font-bold uppercase mb-1">Detalhes do Erro:</p>
                    <code className="text-xs text-red-300 font-mono break-all">{error}</code>
                </div>
            )}

            <div className="flex justify-center gap-4">
                <Link href="/login">
                    <Button variant="primary">Tentar Novamente</Button>
                </Link>
                <Link href="/">
                    <Button variant="ghost">Voltar ao Início</Button>
                </Link>
            </div>
        </>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-hextech-gradient p-4">
            <Card className="max-w-md w-full text-center border-red-900/50">
                <h1 className="text-3xl font-display text-red-500 mb-4">Erro de Autenticação</h1>
                <Suspense fallback={<p>Carregando detalhes...</p>}>
                    <ErrorContent />
                </Suspense>
            </Card>
        </div>
    );
}
