'use client';

/**
 * Price Chart Component
 * Interactive candlestick chart using Lightweight Charts v5
 */

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { useMarketStore } from '@/store/market-store';
import { Signal } from '@/types/trading';

interface PriceChartProps {
    signals?: Signal[];
}

export default function PriceChart({ signals = [] }: PriceChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candleSeriesRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any>(null);

    const { candles, assetName } = useMarketStore();

    // Initialize chart
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0a0a0a' },
                textColor: '#888888',
            },
            grid: {
                vertLines: { color: '#1f1f1f' },
                horzLines: { color: '#1f1f1f' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#3b82f6',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
                horzLine: {
                    color: '#3b82f6',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#3b82f6',
                },
            },
            rightPriceScale: {
                borderColor: '#2a2a2a',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: '#2a2a2a',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Lightweight Charts v5: use addSeries with CandlestickSeries
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        // Handle resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update chart data when candles change
    useEffect(() => {
        if (!candleSeriesRef.current || candles.length === 0) return;

        const chartData = candles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
        }));

        candleSeriesRef.current.setData(chartData);

        // Fit content
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [candles]);

    // Add/update markers for signals - v5 uses createSeriesMarkers
    useEffect(() => {
        if (!candleSeriesRef.current) return;

        try {
            const markerData = signals.map(signal => ({
                time: signal.time,
                position: signal.type === 'BUY' ? 'belowBar' : 'aboveBar',
                color: signal.type === 'BUY' ? '#22c55e' : signal.type === 'SELL' ? '#ef4444' : '#f59e0b',
                shape: signal.type === 'BUY' ? 'arrowUp' : 'arrowDown',
                text: signal.type === 'BUY' ? 'C' : signal.type === 'SELL' ? 'V' : 'X',
            }));

            // In v5, we need to use createSeriesMarkers on the series
            // If markers already exist, update them; otherwise create new
            if (markersRef.current) {
                markersRef.current.setMarkers(markerData);
            } else if (candleSeriesRef.current.createSeriesMarkers) {
                // v5 API
                markersRef.current = candleSeriesRef.current.createSeriesMarkers(markerData);
            } else if (candleSeriesRef.current.setMarkers) {
                // Fallback to v4 API if available
                candleSeriesRef.current.setMarkers(markerData);
            }
        } catch (e) {
            // Silently handle marker errors - markers are optional visualization
            console.warn('Could not set markers:', e);
        }
    }, [signals]);

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {candles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                    <div className="text-center">
                        <div className="text-4xl mb-4">📈</div>
                        <p className="text-[#888888] text-sm">
                            Carga datos históricos para visualizar el gráfico
                        </p>
                    </div>
                </div>
            )}
            {assetName && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-[#1a1a1a] px-3 py-1 rounded-lg text-sm font-semibold">
                        {assetName}
                    </span>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
