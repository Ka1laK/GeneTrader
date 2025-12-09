/**
 * Sample Market Data
 * Embedded data for GitHub Pages deployment (no fetch required)
 */

import { Candle } from '@/types/trading';

// Generate realistic sample data
function generateSampleData(
    symbol: string,
    days: number,
    startPrice: number,
    volatility: number,
    startDate: Date
): Candle[] {
    const data: Candle[] = [];
    let price = startPrice;
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
        // Skip weekends for stock data
        if (symbol !== 'BTC' && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        const change = (Math.random() - 0.48) * volatility;
        const open = price;
        const close = price * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.floor(50000000 + Math.random() * 100000000);

        data.push({
            time: Math.floor(currentDate.getTime() / 1000),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
        });

        price = close;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}

// Pre-generated sample datasets
let spyData: Candle[] | null = null;
let btcData: Candle[] | null = null;
let aaplData: Candle[] | null = null;

export function getSampleData(asset: 'SPY' | 'BTC' | 'AAPL'): Candle[] {
    const startDate = new Date('2020-01-02');

    switch (asset) {
        case 'SPY':
            if (!spyData) {
                spyData = generateSampleData('SPY', 1200, 320, 0.018, startDate);
            }
            return spyData;

        case 'BTC':
            if (!btcData) {
                btcData = generateSampleData('BTC', 1100, 7500, 0.045, startDate);
            }
            return btcData;

        case 'AAPL':
            if (!aaplData) {
                aaplData = generateSampleData('AAPL', 1200, 75, 0.025, startDate);
            }
            return aaplData;

        default:
            throw new Error(`Unknown asset: ${asset}`);
    }
}

export function getAssetInfo(asset: 'SPY' | 'BTC' | 'AAPL'): { name: string; description: string } {
    switch (asset) {
        case 'SPY':
            return { name: 'SPY', description: 'S&P 500 ETF' };
        case 'BTC':
            return { name: 'BTC', description: 'Bitcoin' };
        case 'AAPL':
            return { name: 'AAPL', description: 'Apple Inc.' };
        default:
            return { name: asset, description: '' };
    }
}
