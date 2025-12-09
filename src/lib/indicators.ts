/**
 * Technical Indicators Library
 * Implements common trading indicators: SMA, EMA, RSI, MACD, Bollinger Bands
 */

import { Candle } from '@/types/trading';

/**
 * Simple Moving Average (SMA)
 * Calcula el promedio de los últimos N precios de cierre
 * @param data Array of candles
 * @param period Number of periods to average
 * @returns Array of SMA values (first period-1 values are NaN)
 */
export function calculateSMA(data: Candle[], period: number): number[] {
    const result: number[] = new Array(data.length).fill(NaN);

    if (data.length < period) return result;

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        result[i] = sum / period;
    }

    return result;
}

/**
 * Exponential Moving Average (EMA)
 * Da más peso a los precios recientes que a los antiguos
 * @param data Array of candles
 * @param period Number of periods
 * @returns Array of EMA values
 */
export function calculateEMA(data: Candle[], period: number): number[] {
    const result: number[] = new Array(data.length).fill(NaN);

    if (data.length < period) return result;

    const multiplier = 2 / (period + 1);

    // First EMA is the SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    result[period - 1] = sum / period;

    // Calculate EMA for remaining data points
    for (let i = period; i < data.length; i++) {
        result[i] = (data[i].close - result[i - 1]) * multiplier + result[i - 1];
    }

    return result;
}

/**
 * Relative Strength Index (RSI)
 * Mide la velocidad y magnitud de los cambios de precio (0-100)
 * RSI < 30: Sobreventa (señal de compra potencial)
 * RSI > 70: Sobrecompra (señal de venta potencial)
 * @param data Array of candles
 * @param period Number of periods (typically 14)
 * @returns Array of RSI values (0-100)
 */
export function calculateRSI(data: Candle[], period: number): number[] {
    const result: number[] = new Array(data.length).fill(NaN);

    if (data.length < period + 1) return result;

    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate first average gain/loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // First RSI value
    if (avgLoss === 0) {
        result[period] = 100;
    } else {
        const rs = avgGain / avgLoss;
        result[period] = 100 - (100 / (1 + rs));
    }

    // Calculate remaining RSI values using smoothed averages
    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        if (avgLoss === 0) {
            result[i + 1] = 100;
        } else {
            const rs = avgGain / avgLoss;
            result[i + 1] = 100 - (100 / (1 + rs));
        }
    }

    return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Muestra la relación entre dos EMAs
 * @param data Array of candles
 * @param fastPeriod Fast EMA period (typically 12)
 * @param slowPeriod Slow EMA period (typically 26)
 * @param signalPeriod Signal line period (typically 9)
 * @returns Object with macdLine, signalLine, and histogram
 */
export function calculateMACD(
    data: Candle[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine: number[] = new Array(data.length).fill(NaN);
    const signalLine: number[] = new Array(data.length).fill(NaN);
    const histogram: number[] = new Array(data.length).fill(NaN);

    // Calculate MACD line
    for (let i = slowPeriod - 1; i < data.length; i++) {
        macdLine[i] = fastEMA[i] - slowEMA[i];
    }

    // Calculate Signal line (EMA of MACD)
    const macdValues = macdLine.filter(v => !isNaN(v));
    if (macdValues.length >= signalPeriod) {
        const multiplier = 2 / (signalPeriod + 1);
        let signalStart = slowPeriod - 1 + signalPeriod - 1;

        // First signal value is SMA of MACD
        let sum = 0;
        for (let i = slowPeriod - 1; i < slowPeriod - 1 + signalPeriod; i++) {
            sum += macdLine[i];
        }
        signalLine[signalStart] = sum / signalPeriod;

        // Calculate remaining signal values
        for (let i = signalStart + 1; i < data.length; i++) {
            signalLine[i] = (macdLine[i] - signalLine[i - 1]) * multiplier + signalLine[i - 1];
        }
    }

    // Calculate histogram
    for (let i = 0; i < data.length; i++) {
        if (!isNaN(macdLine[i]) && !isNaN(signalLine[i])) {
            histogram[i] = macdLine[i] - signalLine[i];
        }
    }

    return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 * Bandas de volatilidad alrededor de una SMA
 * @param data Array of candles
 * @param period SMA period (typically 20)
 * @param stdDevMultiplier Standard deviation multiplier (typically 2)
 * @returns Object with upper, middle, and lower bands
 */
export function calculateBollingerBands(
    data: Candle[],
    period: number = 20,
    stdDevMultiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
    const middle = calculateSMA(data, period);
    const upper: number[] = new Array(data.length).fill(NaN);
    const lower: number[] = new Array(data.length).fill(NaN);

    for (let i = period - 1; i < data.length; i++) {
        // Calculate standard deviation
        let sumSquares = 0;
        for (let j = 0; j < period; j++) {
            const diff = data[i - j].close - middle[i];
            sumSquares += diff * diff;
        }
        const stdDev = Math.sqrt(sumSquares / period);

        upper[i] = middle[i] + stdDevMultiplier * stdDev;
        lower[i] = middle[i] - stdDevMultiplier * stdDev;
    }

    return { upper, middle, lower };
}

/**
 * Get indicator value at specific index
 * Utility function to evaluate rules
 */
export function getIndicatorValue(
    indicatorType: string,
    period: number,
    data: Candle[],
    index: number
): number {
    switch (indicatorType) {
        case 'SMA':
            return calculateSMA(data, period)[index];
        case 'EMA':
            return calculateEMA(data, period)[index];
        case 'RSI':
            return calculateRSI(data, period)[index];
        case 'price':
            return data[index]?.close ?? NaN;
        default:
            return NaN;
    }
}

/**
 * Cache for indicator calculations to improve performance
 */
const indicatorCache = new Map<string, number[]>();

export function getCachedIndicator(
    indicatorType: string,
    period: number,
    data: Candle[]
): number[] {
    const key = `${indicatorType}_${period}_${data.length}`;

    if (indicatorCache.has(key)) {
        return indicatorCache.get(key)!;
    }

    let values: number[];
    switch (indicatorType) {
        case 'SMA':
            values = calculateSMA(data, period);
            break;
        case 'EMA':
            values = calculateEMA(data, period);
            break;
        case 'RSI':
            values = calculateRSI(data, period);
            break;
        default:
            values = data.map(c => c.close);
    }

    indicatorCache.set(key, values);
    return values;
}

export function clearIndicatorCache() {
    indicatorCache.clear();
}
