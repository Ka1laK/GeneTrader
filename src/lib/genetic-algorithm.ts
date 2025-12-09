/**
 * Genetic Algorithm Engine for Trading Strategies
 * Implements evolution of trading rule sets
 */

import { Candle } from '@/types/trading';
import {
    Chromosome,
    Rule,
    Individual,
    GAConfig,
    IndicatorType,
    Operator,
    ActionType,
    ComparisonTarget,
    INDICATOR_RANGES,
    DEFAULT_GA_CONFIG,
    GenerationStats,
} from '@/types/genetics';
import { runBacktest, clearIndicatorCache } from './backtester';

// Generate unique ID
function generateId(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
}

// Random number in range
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// Random element from array
function randomChoice<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Create a random rule (gene)
 */
function createRandomRule(): Rule {
    const indicators: IndicatorType[] = ['SMA', 'EMA', 'RSI'];
    const operators: Operator[] = ['>', '<', 'crosses_above', 'crosses_below'];
    const actions: ActionType[] = ['BUY', 'SELL', 'CLOSE'];
    const targets: ComparisonTarget[] = ['SMA', 'EMA', 'price', 'value'];

    const indicator1 = randomChoice(indicators);
    const period1Range = INDICATOR_RANGES[indicator1];
    const period1 = randomInt(period1Range.min, period1Range.max);

    const operator = randomChoice(operators);

    // For RSI, we often compare against a threshold value
    let indicator2: ComparisonTarget;
    let period2: number | null = null;
    let threshold: number | undefined;

    if (indicator1 === 'RSI') {
        // RSI typically compared to threshold values
        if (Math.random() < 0.7) {
            indicator2 = 'value';
            threshold = randomInt(20, 80);
        } else {
            indicator2 = randomChoice(['SMA', 'EMA'] as const);
            const period2Range = INDICATOR_RANGES[indicator2 as IndicatorType];
            period2 = randomInt(period2Range.min, period2Range.max);
        }
    } else {
        // SMA/EMA compared to price or other MA
        indicator2 = randomChoice(targets);
        if (indicator2 !== 'price' && indicator2 !== 'value') {
            const period2Range = INDICATOR_RANGES[indicator2 as IndicatorType];
            period2 = randomInt(period2Range.min, period2Range.max);
        } else if (indicator2 === 'value') {
            threshold = randomFloat(0.9, 1.1); // Price multiplier
        }
    }

    const action = randomChoice(actions);
    const weight = randomFloat(0.3, 1.0);

    return {
        condition: {
            indicator1,
            period1,
            operator,
            indicator2,
            period2,
            threshold,
        },
        action,
        weight,
    };
}

/**
 * Create a random chromosome (strategy)
 */
function createRandomChromosome(config: GAConfig): Chromosome {
    const numRules = randomInt(config.minRulesPerChromosome, config.maxRulesPerChromosome);
    const rules: Rule[] = [];

    for (let i = 0; i < numRules; i++) {
        rules.push(createRandomRule());
    }

    // Ensure at least one BUY and one SELL rule for a valid strategy
    const hasBuy = rules.some(r => r.action === 'BUY');
    const hasSell = rules.some(r => r.action === 'SELL');

    if (!hasBuy) {
        const buyRule = createRandomRule();
        buyRule.action = 'BUY';
        rules.push(buyRule);
    }

    if (!hasSell) {
        const sellRule = createRandomRule();
        sellRule.action = 'SELL';
        rules.push(sellRule);
    }

    return rules;
}

/**
 * Initialize a population of random individuals
 */
export function initializePopulation(config: GAConfig): Individual[] {
    const population: Individual[] = [];

    for (let i = 0; i < config.populationSize; i++) {
        population.push({
            id: generateId(),
            chromosome: createRandomChromosome(config),
            fitness: 0,
            metrics: {
                totalReturn: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                winRate: 0,
                totalTrades: 0,
                profitFactor: 0,
            },
            generation: 0,
        });
    }

    return population;
}

/**
 * Evaluate fitness of an individual
 */
export function evaluateFitness(
    individual: Individual,
    data: Candle[],
    fitnessFunction: string
): Individual {
    const result = runBacktest(individual.chromosome, data);

    // Calculate fitness based on selected function
    let fitness: number;
    switch (fitnessFunction) {
        case 'profit':
            // Maximize total return, penalize no trades
            fitness = result.metrics.totalTrades > 0
                ? result.metrics.totalReturn
                : -100;
            break;
        case 'sharpe':
            // Maximize risk-adjusted returns
            fitness = result.metrics.totalTrades > 3
                ? result.metrics.sharpeRatio
                : -10;
            break;
        case 'drawdown':
            // Minimize drawdown while maintaining profitability
            fitness = result.metrics.totalTrades > 3
                ? result.metrics.totalReturn - result.metrics.maxDrawdown * 2
                : -100;
            break;
        case 'winrate':
            // Maximize win rate with reasonable profit
            fitness = result.metrics.totalTrades > 5
                ? result.metrics.winRate + result.metrics.totalReturn * 0.5
                : -100;
            break;
        default:
            fitness = result.metrics.totalReturn;
    }

    return {
        ...individual,
        fitness,
        metrics: {
            totalReturn: result.metrics.totalReturn,
            sharpeRatio: result.metrics.sharpeRatio,
            maxDrawdown: result.metrics.maxDrawdown,
            winRate: result.metrics.winRate,
            totalTrades: result.metrics.totalTrades,
            profitFactor: result.metrics.profitFactor,
        },
    };
}

/**
 * Evaluate entire population
 */
export function evaluatePopulation(
    population: Individual[],
    data: Candle[],
    fitnessFunction: string
): Individual[] {
    clearIndicatorCache(); // Clear cache for fresh evaluation
    return population.map(ind => evaluateFitness(ind, data, fitnessFunction));
}

/**
 * Tournament selection - select best from random subset
 */
export function tournamentSelection(
    population: Individual[],
    tournamentSize: number
): Individual {
    let best: Individual | null = null;

    for (let i = 0; i < tournamentSize; i++) {
        const contestant = population[randomInt(0, population.length - 1)];
        if (best === null || contestant.fitness > best.fitness) {
            best = contestant;
        }
    }

    return best!;
}

/**
 * Crossover - combine two parent chromosomes
 */
export function crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    // Single-point crossover
    const point1 = randomInt(0, parent1.length - 1);
    const point2 = randomInt(0, parent2.length - 1);

    const child: Chromosome = [
        ...parent1.slice(0, point1),
        ...parent2.slice(point2),
    ];

    // Ensure minimum rules
    if (child.length < 2) {
        child.push(createRandomRule());
    }

    // Limit maximum rules
    if (child.length > 7) {
        return child.slice(0, 7);
    }

    return child;
}

/**
 * Uniform crossover - mix rules from both parents
 */
export function uniformCrossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    const child: Chromosome = [];
    const maxLength = Math.max(parent1.length, parent2.length);

    for (let i = 0; i < maxLength; i++) {
        if (Math.random() < 0.5) {
            if (i < parent1.length) child.push({ ...parent1[i] });
        } else {
            if (i < parent2.length) child.push({ ...parent2[i] });
        }
    }

    if (child.length < 2) {
        child.push(createRandomRule());
        child.push(createRandomRule());
    }

    return child;
}

/**
 * Mutate a chromosome
 */
export function mutate(chromosome: Chromosome, mutationRate: number): Chromosome {
    const mutated = chromosome.map(rule => {
        if (Math.random() < mutationRate) {
            return mutateRule(rule);
        }
        return { ...rule };
    });

    // Chance to add or remove a rule
    if (Math.random() < mutationRate) {
        if (Math.random() < 0.5 && mutated.length < 7) {
            mutated.push(createRandomRule());
        } else if (mutated.length > 2) {
            mutated.splice(randomInt(0, mutated.length - 1), 1);
        }
    }

    return mutated;
}

/**
 * Mutate a single rule
 */
function mutateRule(rule: Rule): Rule {
    const mutated = JSON.parse(JSON.stringify(rule)) as Rule;
    const mutationType = randomInt(1, 5);

    switch (mutationType) {
        case 1:
            // Mutate period1
            const range1 = INDICATOR_RANGES[mutated.condition.indicator1];
            mutated.condition.period1 = Math.min(
                range1.max,
                Math.max(range1.min, mutated.condition.period1 + randomInt(-10, 10))
            );
            break;
        case 2:
            // Mutate period2
            if (mutated.condition.period2 !== null) {
                mutated.condition.period2 = Math.min(
                    200,
                    Math.max(5, mutated.condition.period2 + randomInt(-10, 10))
                );
            }
            break;
        case 3:
            // Mutate threshold
            if (mutated.condition.threshold !== undefined) {
                if (mutated.condition.indicator1 === 'RSI') {
                    mutated.condition.threshold = Math.min(
                        90,
                        Math.max(10, mutated.condition.threshold + randomInt(-10, 10))
                    );
                } else {
                    mutated.condition.threshold *= randomFloat(0.95, 1.05);
                }
            }
            break;
        case 4:
            // Mutate weight
            mutated.weight = Math.min(1, Math.max(0.1, mutated.weight + randomFloat(-0.2, 0.2)));
            break;
        case 5:
            // Mutate operator
            const operators: Operator[] = ['>', '<', 'crosses_above', 'crosses_below'];
            mutated.condition.operator = randomChoice(operators);
            break;
    }

    return mutated;
}

/**
 * Evolve population for one generation
 */
export function evolveGeneration(
    population: Individual[],
    data: Candle[],
    config: GAConfig,
    currentGeneration: number
): { population: Individual[]; stats: GenerationStats } {
    // Evaluate current population
    const evaluated = evaluatePopulation(population, data, config.fitnessFunction);

    // Sort by fitness (descending)
    evaluated.sort((a, b) => b.fitness - a.fitness);

    // Calculate stats
    const fitnesses = evaluated.map(i => i.fitness);
    const stats: GenerationStats = {
        generation: currentGeneration,
        bestFitness: fitnesses[0],
        averageFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
        worstFitness: fitnesses[fitnesses.length - 1],
        diversity: calculateDiversity(evaluated),
    };

    // Create new population
    const newPopulation: Individual[] = [];

    // Elitism - keep best individuals
    const eliteCount = Math.floor(config.populationSize * config.elitismRate);
    for (let i = 0; i < eliteCount; i++) {
        newPopulation.push({
            ...evaluated[i],
            id: generateId(),
            generation: currentGeneration + 1,
        });
    }

    // Fill rest with crossover and mutation
    while (newPopulation.length < config.populationSize) {
        const parent1 = tournamentSelection(evaluated, config.tournamentSize);
        const parent2 = tournamentSelection(evaluated, config.tournamentSize);

        let childChromosome: Chromosome;

        if (Math.random() < config.crossoverRate) {
            childChromosome = Math.random() < 0.5
                ? crossover(parent1.chromosome, parent2.chromosome)
                : uniformCrossover(parent1.chromosome, parent2.chromosome);
        } else {
            childChromosome = [...parent1.chromosome.map(r => ({ ...r }))];
        }

        // Apply mutation
        childChromosome = mutate(childChromosome, config.mutationRate);

        newPopulation.push({
            id: generateId(),
            chromosome: childChromosome,
            fitness: 0,
            metrics: {
                totalReturn: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                winRate: 0,
                totalTrades: 0,
                profitFactor: 0,
            },
            generation: currentGeneration + 1,
        });
    }

    return { population: newPopulation, stats };
}

/**
 * Calculate population diversity (how different are the strategies)
 */
function calculateDiversity(population: Individual[]): number {
    if (population.length < 2) return 0;

    // Calculate average number of unique indicator/period combinations
    const ruleSignatures = new Set<string>();

    for (const individual of population) {
        for (const rule of individual.chromosome) {
            const sig = `${rule.condition.indicator1}_${rule.condition.period1}_${rule.action}`;
            ruleSignatures.add(sig);
        }
    }

    // Normalize by population size
    return ruleSignatures.size / population.length;
}

/**
 * Get top N individuals from population
 */
export function getTopIndividuals(population: Individual[], n: number): Individual[] {
    return [...population]
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, n);
}

/**
 * Export configuration defaults
 */
export { DEFAULT_GA_CONFIG };
