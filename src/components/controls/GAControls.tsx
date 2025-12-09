'use client';

/**
 * GA Controls Component
 * Interactive controls for genetic algorithm parameters with educational tooltips
 */

import { useState } from 'react';
import { Settings, Info, Zap, Users, Shuffle, GitMerge, Target } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';
import { FitnessFunction } from '@/types/genetics';

interface ParameterConfig {
    id: string;
    label: string;
    icon: React.ReactNode;
    min: number;
    max: number;
    step: number;
    unit: string;
    tooltip: string;
    idealRange: string;
    getValue: () => number;
    setValue: (value: number) => void;
}

export default function GAControls() {
    const { config, setConfig } = useGAStore();
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const parameters: ParameterConfig[] = [
        {
            id: 'populationSize',
            label: 'Tamaño de Población',
            icon: <Users size={14} />,
            min: 10,
            max: 200,
            step: 10,
            unit: 'estrategias',
            tooltip: 'Número de estrategias de trading que compiten en cada generación. Una población más grande explora más posibilidades pero es más lenta de evaluar.',
            idealRange: '• 30-50: Rápido para experimentos\n• 50-100: Balance ideal\n• 100-200: Exploración exhaustiva',
            getValue: () => config.populationSize,
            setValue: (v) => setConfig({ populationSize: v }),
        },
        {
            id: 'mutationRate',
            label: 'Tasa de Mutación',
            icon: <Zap size={14} />,
            min: 0.01,
            max: 0.15,
            step: 0.01,
            unit: '%',
            tooltip: 'Probabilidad de alterar aleatoriamente un parámetro en una regla (ej. cambiar SMA(20) a SMA(25)). Es la fuente de innovación y diversidad genética.',
            idealRange: '• 1-3%: Conservador, evolución lenta\n• 5-8%: Balance ideal\n• 10-15%: Mucha exploración, puede perder buenas soluciones',
            getValue: () => config.mutationRate,
            setValue: (v) => setConfig({ mutationRate: v }),
        },
        {
            id: 'crossoverRate',
            label: 'Tasa de Cruce',
            icon: <GitMerge size={14} />,
            min: 0.6,
            max: 0.95,
            step: 0.05,
            unit: '%',
            tooltip: 'Probabilidad de que dos estrategias exitosas se combinen, mezclando sus reglas para crear descendencia híbrida. Permite heredar las mejores características de ambos padres.',
            idealRange: '• 60-70%: Más individuos sin modificar\n• 75-85%: Balance ideal\n• 85-95%: Máxima recombinación genética',
            getValue: () => config.crossoverRate,
            setValue: (v) => setConfig({ crossoverRate: v }),
        },
        {
            id: 'elitismRate',
            label: 'Tasa de Elitismo',
            icon: <Target size={14} />,
            min: 0.05,
            max: 0.3,
            step: 0.05,
            unit: '%',
            tooltip: 'Porcentaje de las mejores estrategias que pasan directamente a la siguiente generación sin modificación. Garantiza que no se pierdan las mejores soluciones encontradas.',
            idealRange: '• 5-10%: Solo los mejores, más diversidad\n• 10-20%: Balance ideal\n• 20-30%: Muy conservador, puede estancar',
            getValue: () => config.elitismRate,
            setValue: (v) => setConfig({ elitismRate: v }),
        },
    ];

    const fitnessFunctions: { id: FitnessFunction; label: string; description: string }[] = [
        {
            id: 'profit',
            label: 'Maximizar Beneficio Neto',
            description: 'Objetivo simple: obtener el mayor retorno posible',
        },
        {
            id: 'sharpe',
            label: 'Maximizar Ratio de Sharpe',
            description: 'Rentabilidad ajustada al riesgo (más sofisticado)',
        },
        {
            id: 'drawdown',
            label: 'Minimizar Drawdown',
            description: 'Prioriza estrategias que no pierden mucho en caídas',
        },
        {
            id: 'winrate',
            label: 'Maximizar Tasa de Acierto',
            description: 'Busca el mayor porcentaje de operaciones ganadoras',
        },
    ];

    const formatValue = (param: ParameterConfig) => {
        const value = param.getValue();
        if (param.unit === '%') {
            return `${(value * 100).toFixed(0)}%`;
        }
        return `${value} ${param.unit}`;
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <Settings size={16} />
                Motor Evolutivo
            </div>

            <div className="space-y-5">
                {/* Parameter sliders */}
                {parameters.map((param) => (
                    <div key={param.id} className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {param.icon}
                                <span className="text-sm font-medium">{param.label}</span>
                                <button
                                    className="text-[#888888] hover:text-[#3b82f6] transition-colors"
                                    onMouseEnter={() => setActiveTooltip(param.id)}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                >
                                    <Info size={14} />
                                </button>
                            </div>
                            <span className="text-sm font-mono text-[#3b82f6]">
                                {formatValue(param)}
                            </span>
                        </div>

                        <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            value={param.getValue()}
                            onChange={(e) => param.setValue(parseFloat(e.target.value))}
                            className="w-full"
                        />

                        {/* Tooltip */}
                        {activeTooltip === param.id && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
                                <p className="text-xs text-[#ededed] mb-2">{param.tooltip}</p>
                                <div className="text-xs text-[#888888]">
                                    <p className="font-semibold mb-1 text-[#3b82f6]">Rangos Ideales:</p>
                                    <pre className="whitespace-pre-wrap">{param.idealRange}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Fitness function selector */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} />
                        <span className="text-sm font-medium">Función de Fitness</span>
                        <button
                            className="text-[#888888] hover:text-[#3b82f6] transition-colors"
                            onMouseEnter={() => setActiveTooltip('fitness')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <Info size={14} />
                        </button>
                    </div>

                    <select
                        value={config.fitnessFunction}
                        onChange={(e) => setConfig({ fitnessFunction: e.target.value as FitnessFunction })}
                        className="w-full"
                    >
                        {fitnessFunctions.map((ff) => (
                            <option key={ff.id} value={ff.id}>
                                {ff.label}
                            </option>
                        ))}
                    </select>

                    <p className="text-[10px] text-[#888888] mt-1">
                        {fitnessFunctions.find(f => f.id === config.fitnessFunction)?.description}
                    </p>

                    {/* Fitness tooltip */}
                    {activeTooltip === 'fitness' && (
                        <div className="absolute left-0 right-0 mt-2 z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
                            <p className="text-xs text-[#ededed] mb-2">
                                La función de fitness determina qué se considera una &ldquo;buena&rdquo; estrategia.
                                Las estrategias con mayor fitness tienen más probabilidades de reproducirse.
                            </p>
                            <div className="text-xs text-[#888888] space-y-1">
                                <p>• <span className="text-[#22c55e]">Beneficio:</span> Ideal para empezar</p>
                                <p>• <span className="text-[#3b82f6]">Sharpe:</span> Mejor para trading real</p>
                                <p>• <span className="text-[#f59e0b]">Drawdown:</span> Si odia las pérdidas</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
