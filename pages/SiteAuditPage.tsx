import React, { useState, useEffect } from 'react';
import type { SeoAnalysis, CompetitorAnalysis } from '../types';
import SeoInput from '../components/SeoInput';
import AuditResults from '../components/AuditResults';
import { XCircleIcon } from '../components/icons/Icons';

interface SiteAuditPageProps {
    onAnalyze: (url: string, competitorUrls: string[], pageContent: string, keyword: string, useGoogleSearch: boolean) => void;
    isLoading: boolean;
    error: string | null;
    loadingMessage: string;
    analysisResult: { analysis: SeoAnalysis; url: string; keyword: string } | null;
    competitorAnalyses: CompetitorAnalysis[];
    useSearchGroundingDefault: boolean;
}

const SiteAuditPage: React.FC<SiteAuditPageProps> = ({
    onAnalyze,
    isLoading,
    error,
    loadingMessage,
    analysisResult,
    competitorAnalyses,
    useSearchGroundingDefault,
}) => {
    const [useSearch, setUseSearch] = useState(useSearchGroundingDefault);

    useEffect(() => {
        setUseSearch(useSearchGroundingDefault);
    }, [useSearchGroundingDefault]);
    
    const handleAnalyzeWrapper = (url: string, competitorUrls: string[], pageContent: string, keyword: string) => {
        onAnalyze(url, competitorUrls, pageContent, keyword, useSearch);
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                 <h1 className="text-3xl font-bold text-slate-100">Site Audit</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Analyze a single page to get a comprehensive SEO report, actionable feedback, and competitor insights.
                </p>
            </div>

            <SeoInput
                onAnalyze={handleAnalyzeWrapper}
                isLoading={isLoading}
                initialUrl={analysisResult?.url}
                initialKeyword={analysisResult?.keyword}
                useSearch={useSearch}
                setUseSearch={setUseSearch}
            />

            {isLoading && (
                <div className="text-center mt-8 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mb-4"></div>
                    <p className="text-lg text-slate-300">{loadingMessage || 'Please wait...'}</p>
                </div>
            )}

            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
                    <XCircleIcon className="w-6 h-6 flex-shrink-0 mt-1" />
                    <pre className="whitespace-pre-wrap font-sans">{error}</pre>
                </div>
            )}
            
            {analysisResult && !isLoading && (
                <div className="mt-8 animate-fade-in">
                    <AuditResults
                        primaryUrl={analysisResult.url}
                        keyword={analysisResult.keyword}
                        data={analysisResult.analysis} 
                        competitorAnalyses={competitorAnalyses}
                    />
                </div>
            )}
        </div>
    );
};

export default SiteAuditPage;