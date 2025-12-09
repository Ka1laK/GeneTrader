'use client';

/**
 * GeneTrader: El Laboratorio de Trading Evolutivo
 * Main page component
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dna, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';
import { useMarketStore } from '@/store/market-store';
import { runBacktest } from '@/lib/backtester';

// All components loaded dynamically without SSR
const PriceChart = dynamic(() => import('@/components/chart/PriceChart'), { ssr: false });
const DataLoader = dynamic(() => import('@/components/chart/DataLoader'), { ssr: false });
const GAControls = dynamic(() => import('@/components/controls/GAControls'), { ssr: false });
const SimulationControls = dynamic(() => import('@/components/controls/SimulationControls'), { ssr: false });
const MetricsPanel = dynamic(() => import('@/components/dashboard/MetricsPanel'), { ssr: false });
const EvolutionChart = dynamic(() => import('@/components/dashboard/EvolutionChart'), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/dashboard/Leaderboard'), { ssr: false });
const GlossaryModal = dynamic(() => import('@/components/glossary/GlossaryModal'), { ssr: false });

export default function HomePage() {
  const [showGlossary, setShowGlossary] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [signals, setLocalSignals] = useState<Array<{ time: number; type: string; price: number; ruleIndex: number }>>([]);

  // Wait for client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading screen during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#3b82f6] mx-auto mb-4" />
          <p className="text-[#888888]">Cargando GeneTrader...</p>
        </div>
      </div>
    );
  }

  return <MainContent showGlossary={showGlossary} setShowGlossary={setShowGlossary} />;
}

// Separate component to isolate store usage
function MainContent({ showGlossary, setShowGlossary }: { showGlossary: boolean; setShowGlossary: (v: boolean) => void }) {
  const bestIndividual = useGAStore((state) => state.bestIndividual);
  const candles = useMarketStore((state) => state.candles);
  const signals = useMarketStore((state) => state.signals);
  const setSignals = useMarketStore((state) => state.setSignals);

  // Update chart signals when best individual changes
  useEffect(() => {
    if (bestIndividual && candles.length > 0) {
      try {
        const result = runBacktest(bestIndividual.chromosome, candles);
        setSignals(result.signals);
      } catch (e) {
        console.error('Backtest error:', e);
      }
    }
  }, [bestIndividual, candles, setSignals]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#111111]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                <Dna size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  GeneTrader
                  <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full">
                    v1.0
                  </span>
                </h1>
                <p className="text-xs text-[#888888]">
                  Laboratorio de Trading Evolutivo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGlossary(true)}
                className="btn btn-secondary"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Glosario</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Introduction banner */}
        <div className="mb-6 bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10 border border-[#3b82f6]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={24} className="text-[#3b82f6] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-[#ededed] mb-1">
                ¡Bienvenido al Laboratorio Evolutivo!
              </h2>
              <p className="text-sm text-[#888888]">
                Aquí podrás experimentar cómo los <strong className="text-[#3b82f6]">algoritmos genéticos</strong> pueden
                evolucionar estrategias de trading para encontrar reglas rentables.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Chart and Data */}
          <div className="lg:col-span-8 space-y-6">
            {/* Price Chart */}
            <div className="panel p-0 overflow-hidden">
              <div className="h-[400px]">
                <PriceChart signals={signals} />
              </div>
            </div>

            {/* Dashboard row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricsPanel />
              <EvolutionChart />
            </div>

            {/* Leaderboard */}
            <Leaderboard />
          </div>

          {/* Right column - Controls */}
          <div className="lg:col-span-4 space-y-6">
            <DataLoader />
            <GAControls />
            <SimulationControls />

            {/* Educational tip card */}
            <div className="panel bg-[#0f1729] border-[#1e3a5f]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <h3 className="font-semibold text-sm text-[#60a5fa] mb-1">
                    Tip Educativo
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Los algoritmos genéticos imitan la <strong className="text-[#ededed]">selección natural</strong>.
                    Las estrategias más rentables sobreviven y se reproducen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-8 pt-6 border-t border-[#2a2a2a] text-center text-xs text-[#888888]">
          <p>
            GeneTrader es una herramienta educativa. Los resultados no garantizan rendimientos futuros.
          </p>
        </footer>
      </main>

      {/* Glossary Modal */}
      {showGlossary && <GlossaryModal isOpen={showGlossary} onClose={() => setShowGlossary(false)} />}
    </div>
  );
}
