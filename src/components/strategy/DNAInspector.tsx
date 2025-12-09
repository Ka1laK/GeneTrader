'use client';

/**
 * DNA Inspector Component
 * Modal that shows the trading rules of a strategy in human-readable format
 */

import { X, Dna, AlertCircle, TrendingUp, TrendingDown, XCircle } from 'lucide-react';
import { Individual, Rule } from '@/types/genetics';
import { formatPercent } from '@/lib/utils';

interface DNAInspectorProps {
    individual: Individual;
    onClose: () => void;
}

// Convert operator to human-readable format
function formatOperator(operator: string): string {
    const operatorMap: Record<string, string> = {
        '>': 'mayor que',
        '<': 'menor que',
        '>=': 'mayor o igual que',
        '<=': 'menor o igual que',
        'crosses_above': 'cruza por encima de',
        'crosses_below': 'cruza por debajo de',
    };
    return operatorMap[operator] || operator;
}

// Convert action to Spanish
function formatAction(action: string): { text: string; color: string; icon: React.ReactNode } {
    switch (action) {
        case 'BUY':
            return { text: 'COMPRAR', color: 'text-[#22c55e]', icon: <TrendingUp size={14} /> };
        case 'SELL':
            return { text: 'VENDER', color: 'text-[#ef4444]', icon: <TrendingDown size={14} /> };
        case 'CLOSE':
            return { text: 'CERRAR', color: 'text-[#f59e0b]', icon: <XCircle size={14} /> };
        default:
            return { text: action, color: 'text-[#888888]', icon: null };
    }
}

// Format indicator with period
function formatIndicator(indicator: string, period: number | null): string {
    if (indicator === 'price') return 'Precio';
    if (indicator === 'value') return 'Valor';
    if (period === null) return indicator;
    return `${indicator}(${period})`;
}

// Convert rule to human-readable format
function RuleDisplay({ rule, index }: { rule: Rule; index: number }) {
    const { condition, action, weight } = rule;
    const actionInfo = formatAction(action);

    const indicator1 = formatIndicator(condition.indicator1, condition.period1);
    const indicator2 = condition.threshold !== undefined && condition.indicator2 === 'value'
        ? condition.threshold.toString()
        : formatIndicator(condition.indicator2, condition.period2);
    const operator = formatOperator(condition.operator);

    return (
        <div className="rule-card">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#888888] font-semibold">
                            REGLA {index + 1}
                        </span>
                        <span className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-0.5 rounded">
                            Peso: {(weight * 100).toFixed(0)}%
                        </span>
                    </div>

                    <div className="text-sm">
                        <span className="text-[#888888]">SI </span>
                        <span className="rule-condition">
                            {indicator1}
                        </span>
                        <span className="text-[#888888]"> {operator} </span>
                        <span className="rule-condition">
                            {indicator2}
                        </span>
                    </div>

                    <div className="text-sm mt-1">
                        <span className="text-[#888888]">ENTONCES </span>
                        <span className={`rule-action ${action.toLowerCase()} flex items-center gap-1 inline-flex`}>
                            {actionInfo.icon}
                            {actionInfo.text}
                        </span>
                    </div>
                </div>

                {/* Weight bar */}
                <div className="w-16">
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#3b82f6] rounded-full"
                            style={{ width: `${weight * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DNAInspector({ individual, onClose }: DNAInspectorProps) {
    const { chromosome, metrics, id, generation } = individual;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                            <Dna size={24} className="text-[#3b82f6]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Inspector de ADN</h2>
                            <p className="text-xs text-[#888888]">
                                Estrategia <code className="bg-[#1a1a1a] px-1 rounded">{id}</code> •
                                Generación {generation}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[#888888]" />
                    </button>
                </div>

                {/* Metrics summary */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <p className="text-xs text-[#888888] mb-1">Retorno</p>
                        <p className={`text-lg font-bold ${metrics.totalReturn >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                            {formatPercent(metrics.totalReturn)}
                        </p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <p className="text-xs text-[#888888] mb-1">Sharpe</p>
                        <p className="text-lg font-bold">{metrics.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <p className="text-xs text-[#888888] mb-1">Drawdown</p>
                        <p className="text-lg font-bold text-[#ef4444]">
                            {formatPercent(-metrics.maxDrawdown)}
                        </p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <p className="text-xs text-[#888888] mb-1">Trades</p>
                        <p className="text-lg font-bold">{metrics.totalTrades}</p>
                    </div>
                </div>

                {/* Rules */}
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#888888] mb-3 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Reglas de Trading ({chromosome.length})
                    </h3>

                    <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                        {chromosome.map((rule, index) => (
                            <RuleDisplay key={index} rule={rule} index={index} />
                        ))}
                    </div>
                </div>

                {/* Explanation */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                        💡 ¿Cómo funciona esta estrategia?
                    </h4>
                    <p className="text-xs text-[#888888] leading-relaxed">
                        Esta estrategia evalúa todas las reglas en cada vela del gráfico.
                        Cuando una condición se cumple, vota por la acción correspondiente
                        con un peso proporcional. La acción con más votos (peso acumulado)
                        se ejecuta si supera el umbral mínimo.
                    </p>
                </div>
            </div>
        </div>
    );
}
