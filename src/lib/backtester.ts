/**
 * Backtesting Engine
 * Simulates trading strategies on historical data
 */

import { Candle, Signal, Trade, PerformanceMetrics, BacktestResult } from '@/types/trading';
import { Chromosome, Rule } from '@/types/genetics';
import { getCachedIndicator, clearIndicatorCache } from './indicators';

interface Position {
    type: 'LONG' | 'SHORT' | null;
    entryPrice: number;
    entryTime: number;
}

/**
 * Evaluate a single rule condition
 */
function evaluateCondition(
    rule: Rule,
    data: Candle[],
    index: number
): boolean {
    const { indicator1, period1, operator, indicator2, period2, threshold } = rule.condition;

    // Get first indicator value
    let value1: number;
    if (indicator1 === 'RSI' && threshold !== undefined) {
        value1 = getCachedIndicator('RSI', period1, data)[index];
    } else {
        value1 = getCachedIndicator(indicator1, period1, data)[index];
    }

    if (isNaN(value1)) return false;

    // Get second value (indicator, price, or threshold)
    let value2: number;
    if (indicator2 === 'price') {
        value2 = data[index].close;
    } else if (indicator2 === 'value' && threshold !== undefined) {
        value2 = threshold;
    } else if (period2 !== null) {
        value2 = getCachedIndicator(indicator2 as string, period2, data)[index];
    } else {
        value2 = threshold ?? 0;
    }

    if (isNaN(value2)) return false;

    // For crossing operators, we need previous values
    if (operator === 'crosses_above' || operator === 'crosses_below') {
        if (index < 1) return false;

        const prevValue1 = getCachedIndicator(indicator1, period1, data)[index - 1];
        let prevValue2: number;
        if (indicator2 === 'price') {
            prevValue2 = data[index - 1].close;
        } else if (period2 !== null) {
            prevValue2 = getCachedIndicator(indicator2 as string, period2, data)[index - 1];
        } else {
            prevValue2 = threshold ?? 0;
        }

        if (isNaN(prevValue1) || isNaN(prevValue2)) return false;

        if (operator === 'crosses_above') {
            return prevValue1 <= prevValue2 && value1 > value2;
        } else {
            return prevValue1 >= prevValue2 && value1 < value2;
        }
    }

    // Simple comparison operators
    switch (operator) {
        case '>':
            return value1 > value2;
        case '<':
            return value1 < value2;
        case '>=':
            return value1 >= value2;
        case '<=':
            return value1 <= value2;
        default:
            return false;
    }
}

/**
 * Evaluate all rules and determine action based on weighted voting
 */
function evaluateChromosome(
    chromosome: Chromosome,
    data: Candle[],
    index: number
): 'BUY' | 'SELL' | 'CLOSE' | null {
    const votes: { BUY: number; SELL: number; CLOSE: number } = {
        BUY: 0,
        SELL: 0,
        CLOSE: 0,
    };

    for (const rule of chromosome) {
        if (evaluateCondition(rule, data, index)) {
            votes[rule.action] += rule.weight;
        }
    }

    // Determine winning action
    const threshold = 0.3; // Minimum weight to trigger action

    if (votes.CLOSE > threshold && votes.CLOSE >= votes.BUY && votes.CLOSE >= votes.SELL) {
        return 'CLOSE';
    }
    if (votes.BUY > threshold && votes.BUY > votes.SELL) {
        return 'BUY';
    }
    if (votes.SELL > threshold && votes.SELL > votes.BUY) {
        return 'SELL';
    }

    return null;
}

/**
 * Run backtest on historical data
 * @param chromosome Trading strategy to test
 * @param data Historical OHLCV data
 * @param initialCapital Starting capital (default 10000)
 * @param commission Trading commission percentage (default 0.1%)
 */
export function runBacktest(
    chromosome: Chromosome,
    data: Candle[],
    initialCapital: number = 10000,
    commission: number = 0.001
): BacktestResult {
    const trades: Trade[] = [];
    const signals: Signal[] = [];
    const equityCurve: { time: number; value: number }[] = [];

    let position: Position = { type: null, entryPrice: 0, entryTime: 0 };
    let capital = initialCapital;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    // Start from period that allows all indicators to calculate
    const warmupPeriod = 50;

    for (let i = warmupPeriod; i < data.length; i++) {
        const action = evaluateChromosome(chromosome, data, i);
        const currentPrice = data[i].close;
        const currentTime = data[i].time;

        if (action === 'BUY' && position.type !== 'LONG') {
            // Close short position if exists
            if (position.type === 'SHORT') {
                const pnl = (position.entryPrice - currentPrice) * (capital / position.entryPrice);
                const pnlPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
                capital = capital + pnl - (capital * commission);

                trades.push({
                    entryTime: position.entryTime,
                    entryPrice: position.entryPrice,
                    exitTime: currentTime,
                    exitPrice: currentPrice,
                    type: 'SHORT',
                    pnl,
                    pnlPercent,
                });

                signals.push({
                    time: currentTime,
                    type: 'CLOSE',
                    price: currentPrice,
                    ruleIndex: -1,
                });
            }

            // Open long position
            position = { type: 'LONG', entryPrice: currentPrice, entryTime: currentTime };
            capital -= capital * commission;

            signals.push({
                time: currentTime,
                type: 'BUY',
                price: currentPrice,
                ruleIndex: 0,
            });
        } else if (action === 'SELL' && position.type !== 'SHORT') {
            // Close long position if exists
            if (position.type === 'LONG') {
                const pnl = (currentPrice - position.entryPrice) * (capital / position.entryPrice);
                const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
                capital = capital + pnl - (capital * commission);

                trades.push({
                    entryTime: position.entryTime,
                    entryPrice: position.entryPrice,
                    exitTime: currentTime,
                    exitPrice: currentPrice,
                    type: 'LONG',
                    pnl,
                    pnlPercent,
                });
            }

            // Open short position
            position = { type: 'SHORT', entryPrice: currentPrice, entryTime: currentTime };
            capital -= capital * commission;

            signals.push({
                time: currentTime,
                type: 'SELL',
                price: currentPrice,
                ruleIndex: 0,
            });
        } else if (action === 'CLOSE' && position.type !== null) {
            // Close any open position
            if (position.type === 'LONG') {
                const pnl = (currentPrice - position.entryPrice) * (capital / position.entryPrice);
                const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
                capital = capital + pnl - (capital * commission);

                trades.push({
                    entryTime: position.entryTime,
                    entryPrice: position.entryPrice,
                    exitTime: currentTime,
                    exitPrice: currentPrice,
                    type: 'LONG',
                    pnl,
                    pnlPercent,
                });
            } else if (position.type === 'SHORT') {
                const pnl = (position.entryPrice - currentPrice) * (capital / position.entryPrice);
                const pnlPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
                capital = capital + pnl - (capital * commission);

                trades.push({
                    entryTime: position.entryTime,
                    entryPrice: position.entryPrice,
                    exitTime: currentTime,
                    exitPrice: currentPrice,
                    type: 'SHORT',
                    pnl,
                    pnlPercent,
                });
            }

            position = { type: null, entryPrice: 0, entryTime: 0 };

            signals.push({
                time: currentTime,
                type: 'CLOSE',
                price: currentPrice,
                ruleIndex: 0,
            });
        }

        // Track equity curve
        let currentEquity = capital;
        if (position.type === 'LONG') {
            currentEquity = capital * (currentPrice / position.entryPrice);
        } else if (position.type === 'SHORT') {
            currentEquity = capital * (2 - currentPrice / position.entryPrice);
        }

        equityCurve.push({ time: currentTime, value: currentEquity });

        // Track max drawdown
        if (currentEquity > peakCapital) {
            peakCapital = currentEquity;
        }
        const drawdown = ((peakCapital - currentEquity) / peakCapital) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    // Close any remaining position at end of data
    if (position.type !== null) {
        const lastCandle = data[data.length - 1];
        const currentPrice = lastCandle.close;

        if (position.type === 'LONG') {
            const pnl = (currentPrice - position.entryPrice) * (capital / position.entryPrice);
            const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
            capital = capital + pnl;

            trades.push({
                entryTime: position.entryTime,
                entryPrice: position.entryPrice,
                exitTime: lastCandle.time,
                exitPrice: currentPrice,
                type: 'LONG',
                pnl,
                pnlPercent,
            });
        } else if (position.type === 'SHORT') {
            const pnl = (position.entryPrice - currentPrice) * (capital / position.entryPrice);
            const pnlPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
            capital = capital + pnl;

            trades.push({
                entryTime: position.entryTime,
                entryPrice: position.entryPrice,
                exitTime: lastCandle.time,
                exitPrice: currentPrice,
                type: 'SHORT',
                pnl,
                pnlPercent,
            });
        }
    }

    // Calculate performance metrics
    const metrics = calculateMetrics(trades, initialCapital, capital, equityCurve, maxDrawdown);

    return { trades, signals, metrics, equityCurve };
}

/**
 * Calculate performance metrics from trades
 */
function calculateMetrics(
    trades: Trade[],
    initialCapital: number,
    finalCapital: number,
    equityCurve: { time: number; value: number }[],
    maxDrawdown: number
): PerformanceMetrics {
    const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100;
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);

    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    const averageWin = winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.pnlPercent, 0) / winningTrades.length
        : 0;
    const averageLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + Math.abs(t.pnlPercent), 0) / losingTrades.length
        : 0;

    // Calculate Sharpe Ratio (simplified daily returns version)
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
        const dailyReturn = (equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value;
        returns.push(dailyReturn);
    }

    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 0
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        : 0;
    const stdDev = Math.sqrt(variance);

    // Annualized Sharpe (assuming daily data, 252 trading days)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    return {
        totalReturn,
        sharpeRatio,
        maxDrawdown,
        winRate,
        totalTrades: trades.length,
        profitFactor,
        averageWin,
        averageLoss,
    };
}

/**
 * Clear indicator cache - call when loading new data
 */
export { clearIndicatorCache };
