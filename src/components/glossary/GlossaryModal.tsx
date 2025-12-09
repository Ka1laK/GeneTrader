'use client';

/**
 * Glossary Modal Component
 * Educational resource for financial and GA terms
 */

import { useState } from 'react';
import { X, Search, BookOpen, Brain, TrendingUp, BarChart3 } from 'lucide-react';
import { glossaryTerms, GlossaryTerm, getTermsByCategory, searchTerms } from '@/lib/glossary-data';

interface GlossaryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const categoryConfig = {
    genetics: {
        label: 'Algoritmos Genéticos',
        icon: <Brain size={14} />,
        color: 'badge-genetics',
    },
    finance: {
        label: 'Indicadores Técnicos',
        icon: <TrendingUp size={14} />,
        color: 'badge-finance',
    },
    trading: {
        label: 'Métricas de Trading',
        icon: <BarChart3 size={14} />,
        color: 'badge-trading',
    },
};

function TermCard({ term }: { term: GlossaryTerm }) {
    const config = categoryConfig[term.category];

    return (
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-3">
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-[#ededed]">{term.term}</h3>
                <span className={`badge ${config.color} flex items-center gap-1`}>
                    {config.icon}
                    {config.label.split(' ')[0]}
                </span>
            </div>
            <p className="text-sm text-[#888888] leading-relaxed mb-2">
                {term.definition}
            </p>
            {term.example && (
                <div className="bg-[#0a0a0a] rounded p-2 mt-2">
                    <p className="text-xs text-[#3b82f6]">
                        <span className="font-semibold">Ejemplo:</span> {term.example}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'genetics' | 'finance' | 'trading'>('all');

    if (!isOpen) return null;

    // Filter terms
    let displayTerms: GlossaryTerm[];
    if (searchQuery) {
        displayTerms = searchTerms(searchQuery);
    } else if (activeCategory === 'all') {
        displayTerms = glossaryTerms;
    } else {
        displayTerms = getTermsByCategory(activeCategory);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                            <BookOpen size={24} className="text-[#3b82f6]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Glosario Educativo</h2>
                            <p className="text-xs text-[#888888]">
                                Términos de trading y algoritmos genéticos
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[#888888]" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                        type="text"
                        placeholder="Buscar términos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#3b82f6]"
                    />
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap`}
                    >
                        Todos ({glossaryTerms.length})
                    </button>
                    <button
                        onClick={() => setActiveCategory('genetics')}
                        className={`btn ${activeCategory === 'genetics' ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap`}
                    >
                        <Brain size={14} />
                        Algoritmos Genéticos
                    </button>
                    <button
                        onClick={() => setActiveCategory('finance')}
                        className={`btn ${activeCategory === 'finance' ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap`}
                    >
                        <TrendingUp size={14} />
                        Indicadores
                    </button>
                    <button
                        onClick={() => setActiveCategory('trading')}
                        className={`btn ${activeCategory === 'trading' ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap`}
                    >
                        <BarChart3 size={14} />
                        Métricas
                    </button>
                </div>

                {/* Terms list */}
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    {displayTerms.length === 0 ? (
                        <div className="text-center py-8 text-[#888888]">
                            <Search size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No se encontraron términos</p>
                        </div>
                    ) : (
                        displayTerms.map((term, index) => (
                            <TermCard key={index} term={term} />
                        ))
                    )}
                </div>

                {/* Footer tip */}
                <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                    <p className="text-xs text-[#888888] text-center">
                        💡 Tip: Pasa el cursor sobre los parámetros del Motor Evolutivo para ver explicaciones detalladas
                    </p>
                </div>
            </div>
        </div>
    );
}
