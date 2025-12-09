'use client';

/**
 * Leaderboard Component
 * Shows top 10 strategies with DNA inspection
 */

import { useState } from 'react';
import { Trophy, Eye, Dna } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';
import { Individual } from '@/types/genetics';
import DNAInspector from '@/components/strategy/DNAInspector';
import { formatPercent } from '@/lib/utils';

export default function Leaderboard() {
    const { leaderboard, generation } = useGAStore();
    const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="text-yellow-400">🥇</span>;
            case 2:
                return <span className="text-gray-300">🥈</span>;
            case 3:
                return <span className="text-amber-600">🥉</span>;
            default:
                return <span className="text-[#888888]">#{rank}</span>;
        }
    };

    const getReturnColor = (value: number): string => {
        if (value > 0) return 'text-[#22c55e]';
        if (value < 0) return 'text-[#ef4444]';
        return 'text-[#888888]';
    };

    if (leaderboard.length === 0) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <Trophy size={16} />
                    Leaderboard de Estrategias
                </div>
                <div className="text-center py-8 text-[#888888]">
                    <Trophy size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Las mejores estrategias aparecerán aquí</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="panel">
                <div className="panel-header">
                    <Trophy size={16} />
                    Top 10 Estrategias
                    <span className="ml-auto text-xs font-normal text-[#3b82f6]">
                        Gen. {generation}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th className="w-12">Rank</th>
                                <th>ID</th>
                                <th className="text-right">Retorno</th>
                                <th className="text-right">Sharpe</th>
                                <th className="text-right">Reglas</th>
                                <th className="w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((individual, index) => (
                                <tr key={individual.id}>
                                    <td className="font-medium">{getRankIcon(index + 1)}</td>
                                    <td>
                                        <code className="text-xs bg-[#1a1a1a] px-2 py-1 rounded">
                                            {individual.id}
                                        </code>
                                    </td>
                                    <td className={`text-right font-mono ${getReturnColor(individual.metrics.totalReturn)}`}>
                                        {formatPercent(individual.metrics.totalReturn)}
                                    </td>
                                    <td className="text-right font-mono text-[#888888]">
                                        {individual.metrics.sharpeRatio.toFixed(2)}
                                    </td>
                                    <td className="text-right text-[#888888]">
                                        {individual.chromosome.length}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedIndividual(individual)}
                                            className="btn btn-secondary py-1 px-2 text-xs"
                                            title="Ver ADN de la estrategia"
                                        >
                                            <Dna size={14} />
                                            ADN
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DNA Inspector Modal */}
            {selectedIndividual && (
                <DNAInspector
                    individual={selectedIndividual}
                    onClose={() => setSelectedIndividual(null)}
                />
            )}
        </>
    );
}
