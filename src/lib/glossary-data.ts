/**
 * Educational Glossary Data
 * Definitions for financial and genetic algorithm terms
 */

export interface GlossaryTerm {
    term: string;
    category: 'finance' | 'genetics' | 'trading';
    definition: string;
    example?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
    // Genetic Algorithm Terms
    {
        term: 'Algoritmo Genético (GA)',
        category: 'genetics',
        definition: 'Técnica de optimización inspirada en la evolución natural. Utiliza mecanismos como selección, cruce y mutación para "evolucionar" soluciones hacia un óptimo.',
        example: 'En trading, un GA puede evolucionar estrategias que maximicen el beneficio probando millones de combinaciones de reglas.',
    },
    {
        term: 'Cromosoma',
        category: 'genetics',
        definition: 'Representación codificada de una solución completa. En nuestro caso, un cromosoma es una estrategia de trading compuesta por múltiples reglas.',
        example: 'Un cromosoma podría contener 3 reglas: "Si SMA(20) > SMA(50) → COMPRAR", "Si RSI(14) > 70 → VENDER", etc.',
    },
    {
        term: 'Gen',
        category: 'genetics',
        definition: 'Unidad básica de información genética. En trading evolutivo, cada gen es una regla individual dentro de la estrategia.',
        example: 'El gen "Si RSI(14) < 30 → COMPRAR" representa una regla de sobreventa.',
    },
    {
        term: 'Población',
        category: 'genetics',
        definition: 'Conjunto de individuos (estrategias) que compiten y evolucionan en cada generación. Una población más grande explora más posibilidades pero es más lenta.',
        example: 'Una población de 50 estrategias competirá para determinar cuáles pasan a la siguiente generación.',
    },
    {
        term: 'Generación',
        category: 'genetics',
        definition: 'Ciclo completo de evaluación, selección, cruce y mutación. Cada generación produce una nueva población que debería ser mejor que la anterior.',
    },
    {
        term: 'Fitness (Aptitud)',
        category: 'genetics',
        definition: 'Medida de qué tan "buena" es una solución. Las estrategias con mayor fitness tienen más probabilidades de reproducirse.',
        example: 'Si optimizamos por beneficio, el fitness de una estrategia sería su retorno total (%).',
    },
    {
        term: 'Selección',
        category: 'genetics',
        definition: 'Proceso de elegir qué individuos se reproducirán. Los más aptos tienen mayor probabilidad de ser seleccionados (selección natural).',
        example: 'Selección por torneo: se toman 3 estrategias al azar y se elige la mejor.',
    },
    {
        term: 'Cruce (Crossover)',
        category: 'genetics',
        definition: 'Operación que combina dos padres para crear offspring. Mezcla características de ambos padres esperando heredar las mejores.',
        example: 'Dos estrategias ganadoras intercambian reglas para crear una nueva estrategia híbrida.',
    },
    {
        term: 'Mutación',
        category: 'genetics',
        definition: 'Cambio aleatorio en un gen para introducir diversidad. Previene que la población se estanque en soluciones subóptimas.',
        example: 'Cambiar SMA(20) a SMA(25) o modificar el peso de una regla de 0.7 a 0.8.',
    },
    {
        term: 'Elitismo',
        category: 'genetics',
        definition: 'Estrategia que garantiza que los mejores individuos pasen directamente a la siguiente generación sin modificación.',
        example: 'Con 10% de elitismo, las 5 mejores estrategias de 50 pasan directamente.',
    },

    // Technical Indicators
    {
        term: 'SMA (Media Móvil Simple)',
        category: 'finance',
        definition: 'Promedio aritmético de los últimos N precios de cierre. Suaviza la acción del precio para identificar tendencias.',
        example: 'SMA(20) = promedio de los últimos 20 cierres. Si el precio > SMA, tendencia alcista.',
    },
    {
        term: 'EMA (Media Móvil Exponencial)',
        category: 'finance',
        definition: 'Similar a SMA pero da más peso a los precios recientes. Reacciona más rápido a cambios de precio.',
        example: 'EMA(12) responde más rápido que SMA(12) a movimientos recientes.',
    },
    {
        term: 'RSI (Índice de Fuerza Relativa)',
        category: 'finance',
        definition: 'Oscilador que mide la velocidad y magnitud de los cambios de precio. Valores entre 0 y 100.',
        example: 'RSI < 30 indica sobreventa (posible compra). RSI > 70 indica sobrecompra (posible venta).',
    },
    {
        term: 'Cruce de Medias',
        category: 'finance',
        definition: 'Señal generada cuando una media móvil rápida cruza una lenta. Cruz dorada (alcista) o cruz de la muerte (bajista).',
        example: 'SMA(50) cruza por encima de SMA(200) = señal de compra a largo plazo.',
    },

    // Performance Metrics
    {
        term: 'Retorno Total',
        category: 'trading',
        definition: 'Porcentaje de ganancia o pérdida total de la estrategia durante el período de backtesting.',
        example: 'Un retorno del +127% significa que $10,000 se convirtieron en $22,700.',
    },
    {
        term: 'Ratio de Sharpe',
        category: 'trading',
        definition: 'Mide el retorno ajustado por riesgo. Retorno promedio dividido por la volatilidad. Mayor es mejor.',
        example: 'Sharpe > 1 es bueno, > 2 es excelente, > 3 es excepcional.',
    },
    {
        term: 'Máxima Caída (Drawdown)',
        category: 'trading',
        definition: 'Mayor pérdida porcentual desde un pico hasta un valle. Mide el peor momento de la estrategia.',
        example: 'Un drawdown del 20% significa que el portafolio cayó 20% desde su máximo antes de recuperarse.',
    },
    {
        term: 'Win Rate (Tasa de Acierto)',
        category: 'trading',
        definition: 'Porcentaje de operaciones que fueron rentables. No indica magnitud de ganancias vs pérdidas.',
        example: '60% win rate = 6 de cada 10 operaciones fueron ganadoras.',
    },
    {
        term: 'Factor de Beneficio',
        category: 'trading',
        definition: 'Ganancias brutas divididas por pérdidas brutas. Valores > 1 indican estrategia rentable.',
        example: 'Factor de beneficio de 1.5 = por cada $1 perdido, se ganaron $1.50.',
    },
    {
        term: 'Backtesting',
        category: 'trading',
        definition: 'Simulación de una estrategia sobre datos históricos para evaluar su rendimiento pasado.',
        example: 'Probar la estrategia con 5 años de datos del S&P 500 para ver cómo habría funcionado.',
    },
    {
        term: 'OHLCV',
        category: 'trading',
        definition: 'Formato estándar de datos de precios: Apertura (Open), Máximo (High), Mínimo (Low), Cierre (Close), Volumen.',
        example: 'Cada vela del gráfico representa estos 5 valores para un período de tiempo.',
    },
    {
        term: 'Señal de Trading',
        category: 'trading',
        definition: 'Indicación de acción (comprar, vender, cerrar) generada por las reglas de la estrategia.',
        example: 'Cuando SMA(20) cruza por encima de SMA(50), se genera una señal de COMPRA.',
    },
];

/**
 * Get terms by category
 */
export function getTermsByCategory(category: 'finance' | 'genetics' | 'trading'): GlossaryTerm[] {
    return glossaryTerms.filter(term => term.category === category);
}

/**
 * Search terms
 */
export function searchTerms(query: string): GlossaryTerm[] {
    const lowerQuery = query.toLowerCase();
    return glossaryTerms.filter(
        term =>
            term.term.toLowerCase().includes(lowerQuery) ||
            term.definition.toLowerCase().includes(lowerQuery)
    );
}
