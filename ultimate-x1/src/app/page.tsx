import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Trophy, Swords } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-hextech-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/bg-texture.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-full bg-radial-hextech opacity-50 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl">

        <div className="flex justify-center mb-6 animate-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-gradient-to-br from-hextech-500 to-hextech-900 rotate-45 rounded-2xl shadow-glow-cyan flex items-center justify-center border border-gold-400">
            <div className="-rotate-45">
              <Trophy className="w-12 h-12 text-gold-300" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-200 to-gold-600 drop-shadow-sm">
          ULTIMATE X1
        </h1>

        <p className="text-xl md:text-2xl text-hextech-400 tracking-widest uppercase font-light">
          Gerenciador de Torneios Premium
        </p>

        <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
          A plataforma definitiva para organizar duelos, gerenciar bans de rotas e controlar o draft de torneios de League of Legends com estilo High Elo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login">
            <Button size="lg" className="w-64 text-lg shadow-glow-cyan">
              <Swords className="mr-2" /> Entrar na Arena
            </Button>
          </Link>

          <Link href="/design-system" className="text-sm text-gray-500 hover:text-hextech-400 transition-colors">
            Ver Design System
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-gray-600 uppercase tracking-widest">
        v2.0 • Powered by Next.js & Supabase
      </footer>
    </div>
  );
}
