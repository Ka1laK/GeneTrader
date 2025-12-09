/**
 * Genetic Algorithm Store
 * Manages GA configuration and evolution state
 */

import { create } from 'zustand';
import {
    Individual,
    GAConfig,
    GenerationStats,
    DEFAULT_GA_CONFIG,
    FitnessFunction,
} from '@/types/genetics';
import { Candle } from '@/types/trading';
import {
    initializePopulation,
    evolveGeneration,
    getTopIndividuals,
    evaluatePopulation,
} from '@/lib/genetic-algorithm';
import { runBacktest } from '@/lib/backtester';

interface GAState {
    // Population
    population: Individual[];
    generation: number;
    isInitialized: boolean;

    // Configuration
    config: GAConfig;

    // Results
    bestIndividual: Individual | null;
    leaderboard: Individual[];
    fitnessHistory: GenerationStats[];

    // Simulation state
    isRunning: boolean;
    speed: number; // ms between generations

    // Actions
    setConfig: (updates: Partial<GAConfig>) => void;
    initialize: (data: Candle[]) => void;
    evolve: (data: Candle[]) => void;
    runSimulation: (data: Candle[]) => void;
    pauseSimulation: () => void;
    reset: () => void;
    setSpeed: (speed: number) => void;
    selectIndividual: (id: string) => Individual | null;
    getSignalsForBest: (data: Candle[]) => void;
}

// Simulation interval reference
let simulationInterval: NodeJS.Timeout | null = null;

export const useGAStore = create<GAState>((set, get) => ({
    population: [],
    generation: 0,
    isInitialized: false,
    config: { ...DEFAULT_GA_CONFIG },
    bestIndividual: null,
    leaderboard: [],
    fitnessHistory: [],
    isRunning: false,
    speed: 500,

    setConfig: (updates: Partial<GAConfig>) => {
        set((state) => ({
            config: { ...state.config, ...updates },
        }));
    },

    initialize: (data: Candle[]) => {
        const { config } = get();

        // Create initial population
        const population = initializePopulation(config);

        // Evaluate initial population
        const evaluated = evaluatePopulation(population, data, config.fitnessFunction);

        // Get leaderboard
        const leaderboard = getTopIndividuals(evaluated, 10);
        const bestIndividual = leaderboard[0] || null;

        // Initial stats
        const fitnesses = evaluated.map(i => i.fitness);
        const initialStats: GenerationStats = {
            generation: 0,
            bestFitness: Math.max(...fitnesses),
            averageFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
            worstFitness: Math.min(...fitnesses),
            diversity: 1,
        };

        set({
            population: evaluated,
            generation: 0,
            isInitialized: true,
            bestIndividual,
            leaderboard,
            fitnessHistory: [initialStats],
        });
    },

    evolve: (data: Candle[]) => {
        const { population, config, generation, fitnessHistory } = get();

        if (population.length === 0) return;

        const { population: newPopulation, stats } = evolveGeneration(
            population,
            data,
            config,
            generation
        );

        // Evaluate new population
        const evaluated = evaluatePopulation(newPopulation, data, config.fitnessFunction);

        // Get leaderboard
        const leaderboard = getTopIndividuals(evaluated, 10);
        const bestIndividual = leaderboard[0] || null;

        set({
            population: evaluated,
            generation: generation + 1,
            bestIndividual,
            leaderboard,
            fitnessHistory: [...fitnessHistory, { ...stats, generation: generation + 1 }],
        });
    },

    runSimulation: (data: Candle[]) => {
        const { isInitialized, speed } = get();

        if (!isInitialized) {
            get().initialize(data);
        }

        set({ isRunning: true });

        // Clear any existing interval
        if (simulationInterval) {
            clearInterval(simulationInterval);
        }

        // Start evolution loop
        simulationInterval = setInterval(() => {
            const state = get();
            if (!state.isRunning) {
                if (simulationInterval) clearInterval(simulationInterval);
                return;
            }
            state.evolve(data);
        }, speed);
    },

    pauseSimulation: () => {
        set({ isRunning: false });
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
    },

    reset: () => {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }

        set({
            population: [],
            generation: 0,
            isInitialized: false,
            bestIndividual: null,
            leaderboard: [],
            fitnessHistory: [],
            isRunning: false,
        });
    },

    setSpeed: (speed: number) => {
        set({ speed });

        // If running, restart with new speed
        const { isRunning } = get();
        if (isRunning && simulationInterval) {
            // Will be picked up on next interval
        }
    },

    selectIndividual: (id: string) => {
        const { population } = get();
        return population.find(ind => ind.id === id) || null;
    },

    getSignalsForBest: (data: Candle[]) => {
        const { bestIndividual } = get();
        if (!bestIndividual) return;

        const result = runBacktest(bestIndividual.chromosome, data);
        // Signals are available in result.signals
        // This will be used by the chart component
    },
}));
