'use client';

/**
 * Data Loader Component
 * Handles CSV upload and sample data selection
 */

import { useRef, useState } from 'react';
import { Upload, Database, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useMarketStore } from '@/store/market-store';
import { useGAStore } from '@/store/ga-store';

type SampleAsset = 'SPY' | 'BTC' | 'AAPL';

const sampleAssets: { id: SampleAsset; name: string; description: string }[] = [
    { id: 'SPY', name: 'S&P 500 ETF', description: '5 años de datos diarios' },
    { id: 'BTC', name: 'Bitcoin', description: '3 años de datos diarios' },
    { id: 'AAPL', name: 'Apple Inc.', description: '3 años de datos diarios' },
];

export default function DataLoader() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoadingSample, setIsLoadingSample] = useState<SampleAsset | null>(null);

    const { loadFromCSV, loadSampleData, isLoading, error, candles, assetName } = useMarketStore();
    const { reset: resetGA } = useGAStore();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        resetGA(); // Reset GA when loading new data
        await loadFromCSV(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSampleLoad = (asset: SampleAsset) => {
        setIsLoadingSample(asset);
        resetGA(); // Reset GA when loading new data

        // Use setTimeout to show loading state briefly
        setTimeout(() => {
            loadSampleData(asset);
            setIsLoadingSample(null);
        }, 100);
    };

    return (
        <div className="panel">
            <div className="panel-header">
                <Database size={16} />
                Datos de Mercado
            </div>

            {/* Current data info */}
            {candles.length > 0 && (
                <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium">{assetName}</span>
                            <span className="text-xs text-[#888888] ml-2">
                                {candles.length.toLocaleString()} velas
                            </span>
                        </div>
                        <span className="text-xs text-[#22c55e]">✓ Cargado</span>
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Sample data buttons */}
            <div className="mb-4">
                <p className="text-xs text-[#888888] mb-2">Datos de ejemplo:</p>
                <div className="grid grid-cols-3 gap-2">
                    {sampleAssets.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => handleSampleLoad(asset.id)}
                            disabled={isLoading || isLoadingSample !== null}
                            className="btn btn-secondary flex-col py-3 text-center"
                        >
                            {isLoadingSample === asset.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span className="text-sm font-medium">{asset.id}</span>
                                    <span className="text-[10px] text-[#888888]">{asset.name}</span>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* CSV Upload */}
            <div>
                <p className="text-xs text-[#888888] mb-2">O sube tu archivo CSV:</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                />
                <label
                    htmlFor="csv-upload"
                    className="btn btn-secondary w-full justify-center cursor-pointer"
                >
                    {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <>
                            <Upload size={16} />
                            Subir CSV
                        </>
                    )}
                </label>
                <p className="text-[10px] text-[#888888] mt-2 text-center">
                    Formato: Date, Open, High, Low, Close, Volume
                </p>
            </div>
        </div>
    );
}
