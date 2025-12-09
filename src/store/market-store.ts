/**
 * Market Data Store
 * Manages OHLCV data and trading signals
 */

import { create } from 'zustand';
import { Candle, Signal } from '@/types/trading';
import Papa from 'papaparse';

interface MarketState {
    candles: Candle[];
    signals: Signal[];
    assetName: string;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadFromCSV: (file: File) => Promise<void>;
    loadSampleData: (asset: 'SPY' | 'BTC' | 'AAPL') => Promise<void>;
    setSignals: (signals: Signal[]) => void;
    clearSignals: () => void;
    clearData: () => void;
}

// Parse CSV date to Unix timestamp
function parseDate(dateStr: string): number {
    const date = new Date(dateStr);
    return Math.floor(date.getTime() / 1000);
}

export const useMarketStore = create<MarketState>((set) => ({
    candles: [],
    signals: [],
    assetName: '',
    isLoading: false,
    error: null,

    loadFromCSV: async (file: File) => {
        set({ isLoading: true, error: null });

        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const candles: Candle[] = (results.data as any[]).map((row: Record<string, string>) => {
                            // Support multiple date column names
                            const dateCol = row['Date'] || row['date'] || row['Fecha'] || row['timestamp'];
                            const openCol = row['Open'] || row['open'] || row['Apertura'];
                            const highCol = row['High'] || row['high'] || row['Máximo'] || row['Maximo'];
                            const lowCol = row['Low'] || row['low'] || row['Mínimo'] || row['Minimo'];
                            const closeCol = row['Close'] || row['close'] || row['Cierre'];
                            const volumeCol = row['Volume'] || row['volume'] || row['Volumen'] || '0';

                            return {
                                time: parseDate(dateCol),
                                open: parseFloat(openCol),
                                high: parseFloat(highCol),
                                low: parseFloat(lowCol),
                                close: parseFloat(closeCol),
                                volume: parseFloat(volumeCol) || 0,
                            };
                        }).filter(c => !isNaN(c.time) && !isNaN(c.close));

                        // Sort by time
                        candles.sort((a, b) => a.time - b.time);

                        set({
                            candles,
                            assetName: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
                            isLoading: false,
                            signals: [],
                        });
                        resolve();
                    } catch (err) {
                        const errorMsg = err instanceof Error ? err.message : 'Error parsing CSV';
                        set({ error: errorMsg, isLoading: false });
                        reject(err);
                    }
                },
                error: (err) => {
                    set({ error: err.message, isLoading: false });
                    reject(err);
                },
            });
        });
    },

    loadSampleData: async (asset: 'SPY' | 'BTC' | 'AAPL') => {
        set({ isLoading: true, error: null });

        try {
            // Use relative path for GitHub Pages compatibility
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const response = await fetch(`${basePath}/data/${asset.toLowerCase()}_data.csv`);
            if (!response.ok) {
                throw new Error(`Failed to load ${asset} data`);
            }

            const csvText = await response.text();

            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const candles: Candle[] = (results.data as any[]).map((row: Record<string, string>) => {
                                const dateCol = row['Date'] || row['date'] || row['Fecha'];
                                const openCol = row['Open'] || row['open'];
                                const highCol = row['High'] || row['high'];
                                const lowCol = row['Low'] || row['low'];
                                const closeCol = row['Close'] || row['close'];
                                const volumeCol = row['Volume'] || row['volume'] || '0';

                                return {
                                    time: parseDate(dateCol),
                                    open: parseFloat(openCol),
                                    high: parseFloat(highCol),
                                    low: parseFloat(lowCol),
                                    close: parseFloat(closeCol),
                                    volume: parseFloat(volumeCol) || 0,
                                };
                            }).filter(c => !isNaN(c.time) && !isNaN(c.close));

                            candles.sort((a, b) => a.time - b.time);

                            set({
                                candles,
                                assetName: asset,
                                isLoading: false,
                                signals: [],
                            });
                            resolve();
                        } catch (err) {
                            const errorMsg = err instanceof Error ? err.message : 'Error parsing data';
                            set({ error: errorMsg, isLoading: false });
                            reject(err);
                        }
                    },
                    error: (err: Error) => {
                        set({ error: err.message, isLoading: false });
                        reject(err);
                    },
                });
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error loading sample data';
            set({ error: errorMsg, isLoading: false });
            throw err;
        }
    },

    setSignals: (signals: Signal[]) => {
        set({ signals });
    },

    clearSignals: () => {
        set({ signals: [] });
    },

    clearData: () => {
        set({
            candles: [],
            signals: [],
            assetName: '',
            error: null,
        });
    },
}));
