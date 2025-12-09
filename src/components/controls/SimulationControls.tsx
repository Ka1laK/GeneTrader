'use client';

/**
 * Simulation Controls Component
 * Play/Pause/Reset controls and speed adjustment
 */

import { Play, Pause, RotateCcw, FastForward, Gauge } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';
import { useMarketStore } from '@/store/market-store';

export default function SimulationControls() {
    const { isRunning, isInitialized, generation, speed, runSimulation, pauseSimulation, reset, setSpeed } = useGAStore();
    const { candles } = useMarketStore();

    const hasData = candles.length > 0;

    const handlePlayPause = () => {
        if (isRunning) {
            pauseSimulation();
        } else {
            runSimulation(candles);
        }
    };

    const handleReset = () => {
        reset();
    };

    const speedOptions = [
        { value: 1000, label: 'Lenta', icon: '🐢' },
        { value: 500, label: 'Normal', icon: '🚶' },
        { value: 200, label: 'Rápida', icon: '🏃' },
        { value: 50, label: 'Turbo', icon: '⚡' },
    ];

    return (
        <div className="panel">
            <div className="panel-header">
                <Gauge size={16} />
                Control de Simulación
            </div>

            {/* Generation counter */}
            <div className="text-center mb-4 p-3 bg-[#1a1a1a] rounded-lg">
                <p className="text-xs text-[#888888] mb-1">Generación Actual</p>
                <p className="text-3xl font-bold font-mono text-[#3b82f6]">
                    {generation}
                </p>
                {isRunning && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#22c55e] mt-1">
                        <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                        Evolucionando...
                    </span>
                )}
            </div>

            {/* Control buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={handlePlayPause}
                    disabled={!hasData}
                    className={`btn flex-1 ${isRunning
                            ? 'btn-secondary'
                            : 'btn-success'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Pause size={18} />
                            Pausar
                        </>
                    ) : (
                        <>
                            <Play size={18} />
                            {isInitialized ? 'Continuar' : 'Iniciar'}
                        </>
                    )}
                </button>

                <button
                    onClick={handleReset}
                    disabled={!isInitialized || isRunning}
                    className="btn btn-secondary"
                    title="Reiniciar evolución"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Speed control */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <FastForward size={14} />
                    <span className="text-sm font-medium">Velocidad</span>
                </div>

                <div className="grid grid-cols-4 gap-1">
                    {speedOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSpeed(option.value)}
                            className={`py-2 px-1 rounded-lg text-center transition-all ${speed === option.value
                                    ? 'bg-[#3b82f6] text-white'
                                    : 'bg-[#1a1a1a] text-[#888888] hover:bg-[#2a2a2a]'
                                }`}
                        >
                            <span className="text-lg">{option.icon}</span>
                            <span className="block text-[10px] mt-1">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Status messages */}
            {!hasData && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-yellow-400">
                        ⚠️ Carga datos de mercado primero para iniciar la simulación
                    </p>
                </div>
            )}
        </div>
    );
}
