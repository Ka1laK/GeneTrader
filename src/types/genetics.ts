// Types for Genetic Algorithm - Strategy DNA representation

export type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BB';
export type ComparisonTarget = 'SMA' | 'EMA' | 'RSI' | 'price' | 'value';
export type Operator = '>' | '<' | '>=' | '<=' | 'crosses_above' | 'crosses_below';
export type ActionType = 'BUY' | 'SELL' | 'CLOSE';
export type FitnessFunction = 'profit' | 'sharpe' | 'drawdown' | 'winrate';

// A single rule (gene) in the strategy
export interface Rule {
    condition: {
        indicator1: IndicatorType;
        period1: number;
        operator: Operator;
        indicator2: ComparisonTarget;
        period2: number | null;
        threshold?: number; // For RSI comparisons (e.g., RSI < 30)
    };
    action: ActionType;
    weight: number; // 0-1, importance of this rule
}

// A complete trading strategy (chromosome)
export type Chromosome = Rule[];

// An individual in the population
export interface Individual {
    id: string;
    chromosome: Chromosome;
    fitness: number;
    metrics: {
        totalReturn: number;
        sharpeRatio: number;
        maxDrawdown: number;
        winRate: number;
        totalTrades: number;
        profitFactor: number;
    };
    generation: number;
}

// Population statistics per generation
export interface GenerationStats {
    generation: number;
    bestFitness: number;
    averageFitness: number;
    worstFitness: number;
    diversity: number; // How different are the strategies
}

// GA Configuration
export interface GAConfig {
    populationSize: number;
    mutationRate: number;
    crossoverRate: number;
    elitismRate: number;
    tournamentSize: number;
    maxRulesPerChromosome: number;
    minRulesPerChromosome: number;
    fitnessFunction: FitnessFunction;
}

// Indicator parameter ranges for mutation
export const INDICATOR_RANGES: Record<IndicatorType, { min: number; max: number }> = {
    SMA: { min: 5, max: 200 },
    EMA: { min: 5, max: 200 },
    RSI: { min: 7, max: 28 },
    MACD: { min: 12, max: 26 },
    BB: { min: 10, max: 50 },
};

// Default GA configuration
export const DEFAULT_GA_CONFIG: GAConfig = {
    populationSize: 50,
    mutationRate: 0.05,
    crossoverRate: 0.8,
    elitismRate: 0.1,
    tournamentSize: 3,
    maxRulesPerChromosome: 5,
    minRulesPerChromosome: 2,
    fitnessFunction: 'profit',
};
