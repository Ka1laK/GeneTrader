// Types for OHLCV market data and trading signals

export interface Candle {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Signal {
    time: number;
    type: 'BUY' | 'SELL' | 'CLOSE';
    price: number;
    ruleIndex: number;
}

export interface Trade {
    entryTime: number;
    entryPrice: number;
    exitTime: number;
    exitPrice: number;
    type: 'LONG' | 'SHORT';
    pnl: number;
    pnlPercent: number;
}

export interface PerformanceMetrics {
    totalReturn: number;        // Total return percentage
    sharpeRatio: number;        // Risk-adjusted return
    maxDrawdown: number;        // Maximum drawdown percentage
    winRate: number;            // Percentage of winning trades
    totalTrades: number;        // Number of completed trades
    profitFactor: number;       // Gross profit / Gross loss
    averageWin: number;         // Average winning trade %
    averageLoss: number;        // Average losing trade %
}

export interface BacktestResult {
    trades: Trade[];
    signals: Signal[];
    metrics: PerformanceMetrics;
    equityCurve: { time: number; value: number }[];
}
