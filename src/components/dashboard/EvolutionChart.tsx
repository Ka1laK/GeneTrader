'use client';

/**
 * Evolution Chart Component
 * Line chart showing fitness improvement over generations
 * Uses useState + useEffect to ensure real-time updates
 */

import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useGAStore } from '@/store/ga-store';

interface ChartDataPoint {
    generation: number;
    best: number;
    average: number;
    worst: number;
}

export default function EvolutionChart() {
    // Local state to force re-renders
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [currentGen, setCurrentGen] = useState(0);

    // Subscribe to store changes
    const fitnessHistory = useGAStore((state) => state.fitnessHistory);
    const generation = useGAStore((state) => state.generation);
    const isRunning = useGAStore((state) => state.isRunning);

    // Update local state whenever store changes
    useEffect(() => {
        const newData = fitnessHistory.map((stat) => ({
            generation: stat.generation,
            best: parseFloat(stat.bestFitness.toFixed(2)),
            average: parseFloat(stat.averageFitness.toFixed(2)),
            worst: parseFloat(stat.worstFitness.toFixed(2)),
        }));

        setChartData(newData);
        setCurrentGen(generation);
    }, [fitnessHistory, generation, fitnessHistory.length]);

    // Empty state
    if (chartData.length === 0) {
        return (
            <div className="panel h-full">
                <div className="panel-header">
                    <TrendingUp size={16} />
                    Evolución del Fitness
                </div>
                <div className="flex items-center justify-center h-48 text-[#888888]">
                    <div className="text-center">
                        <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">El gráfico aparecerá al iniciar la evolución</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel h-full">
            <div className="panel-header">
                <TrendingUp size={16} />
                Evolución del Fitness
                <span className="ml-auto text-xs font-normal flex items-center gap-2">
                    {isRunning && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    Gen {currentGen} ({chartData.length} pts)
                </span>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />

                        <XAxis
                            dataKey="generation"
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #2a2a2a',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            labelStyle={{ color: '#888888' }}
                            formatter={(value: number, name: string) => {
                                const labels: Record<string, string> = {
                                    best: 'Mejor',
                                    average: 'Promedio',
                                    worst: 'Peor',
                                };
                                return [`${value.toFixed(2)}%`, labels[name] || name];
                            }}
                            labelFormatter={(label) => `Generación ${label}`}
                        />

                        {/* Average fitness area */}
                        <Area
                            type="monotone"
                            dataKey="average"
                            stroke="#3b82f6"
                            strokeWidth={1}
                            fillOpacity={1}
                            fill="url(#colorAvg)"
                            isAnimationActive={false}
                        />

                        {/* Best fitness line */}
                        <Area
                            type="monotone"
                            dataKey="best"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBest)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#22c55e] rounded-full" />
                    <span className="text-xs text-[#888888]">Mejor</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#3b82f6] rounded-full" />
                    <span className="text-xs text-[#888888]">Promedio</span>
                </div>
            </div>
        </div>
    );
}
