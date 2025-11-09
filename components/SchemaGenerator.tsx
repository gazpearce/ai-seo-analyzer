import React, { useState } from 'react';
import { generateSchemaMarkup } from '../services/geminiService';
import { fetchPageContent } from '../services/pageFetcher';
import type { SeoFactor } from '../types';
import { CpuChipIcon, SparklesIcon, DocumentDuplicateIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons';

interface SchemaGeneratorProps {
    primaryUrl: string;
    keyword: string;
    structuredDataScore: SeoFactor;
}

const SchemaGenerator: React.FC<SchemaGeneratorProps> = ({ primaryUrl, keyword, structuredDataScore }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedSchema, setGeneratedSchema] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedSchema(null);

        try {
            if (!primaryUrl || !primaryUrl.startsWith('http')) {
                throw new Error("A valid primary URL is required to fetch content for schema generation.");
            }
            const pageContent = await fetchPageContent(primaryUrl);
            const schema = await generateSchemaMarkup(pageContent, keyword || 'this webpage');
            setGeneratedSchema(schema);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedSchema) {
            navigator.clipboard.writeText(generatedSchema);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <section>
            <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
                <CpuChipIcon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-slate-200">AI Schema.org Generator</h2>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    <div>
                        <p className="text-slate-300">
                            Current Structured Data Score: <span className="font-bold text-lg text-indigo-400">{structuredDataScore.score}/100</span>
                        </p>
                         <p className="text-sm text-slate-400 max-w-2xl">{structuredDataScore.feedback}</p>
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                    >
                         {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Generate Schema</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
                         <XCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                         <p>{error}</p>
                    </div>
                )}
                
                {generatedSchema && (
                    <div className="mt-6 animate-fade-in">
                        <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-4">
                            <pre className="text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-96">
                                <code>{generatedSchema}</code>
                            </pre>
                            <button
                                onClick={handleCopy}
                                disabled={isCopied}
                                className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 disabled:opacity-60 transition-colors"
                            >
                                {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                {isCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SchemaGenerator;