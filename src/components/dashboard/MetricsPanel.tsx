'use client';

/**
 * Metrics Panel Component
 * Displays key performance metrics for the best strategy
 */

import { TrendingUp, Activity, TrendingDown, Target, BarChart3, Award } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';
import { formatPercent } from '@/lib/utils';

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    colorClass?: string;
    tooltip?: string;
}

function MetricCard({ label, value, icon, colorClass = '', tooltip }: MetricCardProps) {
    return (
        <div className="metric-card group relative">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[#888888]">{icon}</span>
                <span className="metric-label">{label}</span>
            </div>
            <p className={`metric-value ${colorClass}`}>{value}</p>
            {tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-[#888888] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {tooltip}
                </div>
            )}
        </div>
    );
}

export default function MetricsPanel() {
    const { bestIndividual, generation } = useGAStore();

    const getValueColor = (value: number): string => {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return '';
    };

    const formatSharpe = (value: number): string => {
        return value.toFixed(2);
    };

    if (!bestIndividual) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <BarChart3 size={16} />
                    Métricas de Rendimiento
                </div>
                <div className="text-center py-8 text-[#888888]">
                    <Activity size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inicia la simulación para ver métricas</p>
                </div>
            </div>
        );
    }

    const { metrics } = bestIndividual;

    return (
        <div className="panel">
            <div className="panel-header">
                <BarChart3 size={16} />
                Métricas de la Mejor Estrategia
                <span className="ml-auto text-xs font-normal text-[#3b82f6]">
                    Gen. {generation}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <MetricCard
                    label="Retorno Total"
                    value={formatPercent(metrics.totalReturn)}
                    icon={<TrendingUp size={14} />}
                    colorClass={getValueColor(metrics.totalReturn)}
                    tooltip="Porcentaje de ganancia/pérdida total"
                />

                <MetricCard
                    label="Ratio de Sharpe"
                    value={formatSharpe(metrics.sharpeRatio)}
                    icon={<Award size={14} />}
                    colorClass={metrics.sharpeRatio > 1 ? 'positive' : metrics.sharpeRatio < 0 ? 'negative' : ''}
                    tooltip="> 1 bueno, > 2 excelente"
                />

                <MetricCard
                    label="Máx. Drawdown"
                    value={formatPercent(-metrics.maxDrawdown)}
                    icon={<TrendingDown size={14} />}
                    colorClass="negative"
                    tooltip="Mayor caída desde un pico"
                />

                <MetricCard
                    label="Win Rate"
                    value={`${metrics.winRate.toFixed(1)}%`}
                    icon={<Target size={14} />}
                    colorClass={metrics.winRate > 50 ? 'positive' : ''}
                    tooltip="% de operaciones ganadoras"
                />

                <MetricCard
                    label="Operaciones"
                    value={metrics.totalTrades.toString()}
                    icon={<Activity size={14} />}
                    tooltip="Número total de trades"
                />

                <MetricCard
                    label="Factor Beneficio"
                    value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
                    icon={<BarChart3 size={14} />}
                    colorClass={metrics.profitFactor > 1 ? 'positive' : 'negative'}
                    tooltip="Ganancia bruta / Pérdida bruta"
                />
            </div>
        </div>
    );
}
