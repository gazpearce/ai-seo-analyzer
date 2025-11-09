import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ContentAnalysis } from '../types';
import { SparklesIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../components/icons/Icons';

interface ContentEditorPageProps {
    onAnalyzeContent: (content: string, keyword: string) => Promise<ContentAnalysis | null>;
    initialAnalysis: ContentAnalysis | null;
    apiError: string | null;
}

const DEBOUNCE_DELAY = 1500; // 1.5 seconds

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const getStatusStyles = (s: number) => {
        if (s >= 80) return { ring: 'text-green-400', text: 'text-green-300' };
        if (s >= 50) return { ring: 'text-yellow-400', text: 'text-yellow-300' };
        return { ring: 'text-red-400', text: 'text-red-300' };
    };
    const styles = getStatusStyles(score);
    const circumference = 2 * Math.PI * 34; // 2 * pi * radius
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 72 72">
                <circle className="text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="34" cx="36" cy="36" />
                <circle
                    className={`${styles.ring} transform -rotate-90 origin-center`}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="36"
                    cy="36"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="text-center">
                <span className={`text-4xl font-bold ${styles.text}`}>{score}</span>
                <p className="text-sm text-slate-400">/ 100</p>
            </div>
        </div>
    );
};

const ChecklistItem: React.FC<{ item: { met: boolean, feedback: string }, title: string }> = ({ item, title }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
                {item.met ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <XCircleIcon className="w-5 h-5 text-red-400" />}
            </div>
            <div>
                <h4 className="font-semibold text-slate-200">{title}</h4>
                <p className="text-sm text-slate-400">{item.feedback}</p>
            </div>
        </div>
    )
};

const ContentEditorPage: React.FC<ContentEditorPageProps> = ({ onAnalyzeContent, initialAnalysis, apiError }) => {
    const [keyword, setKeyword] = useState('');
    const [content, setContent] = useState('');
    const [analysis, setAnalysis] = useState<ContentAnalysis | null>(initialAnalysis);
    const [isLoading, setIsLoading] = useState(false);
    
    const debounceTimeout = useRef<number | null>(null);

    const triggerAnalysis = useCallback(async (currentContent: string, currentKeyword: string) => {
        if (!currentContent.trim() || !currentKeyword.trim()) {
            setAnalysis(null);
            return;
        }
        setIsLoading(true);
        const result = await onAnalyzeContent(currentContent, currentKeyword);
        if(result) {
            setAnalysis(result);
        }
        setIsLoading(false);
    }, [onAnalyzeContent]);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        if (content.trim() && keyword.trim()) {
            debounceTimeout.current = window.setTimeout(() => {
                triggerAnalysis(content, keyword);
            }, DEBOUNCE_DELAY);
        }
        // Cleanup on unmount
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [content, keyword, triggerAnalysis]);

    const AnalysisSidebar: React.FC<{ analysis: ContentAnalysis | null, isLoading: boolean, error: string | null }> = ({ analysis, isLoading, error }) => (
        <div className="w-full lg:w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 self-start sticky top-6">
            <h2 className="text-xl font-bold text-slate-100">Content Analysis</h2>
            
            {isLoading && !analysis && (
                 <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3"></div>
                    <p className="text-sm text-slate-400">Analyzing...</p>
                </div>
            )}

            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded-md text-sm">{error}</div>}

            {!isLoading && !analysis && !error && (
                <div className="text-center py-10 text-slate-500">
                    <p>Enter a target keyword and start writing to see a real-time SEO analysis.</p>
                </div>
            )}
            
            {analysis && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col items-center text-center bg-slate-800/50 p-4 rounded-lg">
                        <ScoreRing score={analysis.overallScore} />
                        <div className="mt-4">
                            <h3 className="font-semibold text-slate-200">Overall Feedback</h3>
                            <p className="text-sm text-slate-400">{analysis.overallFeedback}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-400">Word Count</p>
                            <p className="text-xl font-bold text-slate-100">{analysis.wordCount}</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-400">Readability</p>
                            <p className="text-xl font-bold text-slate-100">Grade {analysis.readabilityGrade}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-200 mb-3">Keyword Checklist</h3>
                        <div className="space-y-3">
                            <ChecklistItem item={analysis.keywordChecklist.inHeadline} title="Keyword in Headline" />
                            <ChecklistItem item={analysis.keywordChecklist.inSubheading} title="Keyword in Subheading" />
                            <ChecklistItem item={analysis.keywordChecklist.inFirstParagraph} title="Keyword in First Paragraph" />
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-slate-200 mb-3">Semantic Keywords</h3>
                        <p className="text-sm text-slate-400 mb-4">Include these related terms to improve topical authority.</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.semanticKeywords.map(sk => (
                                <span key={sk.keyword} className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md font-mono ${sk.included ? 'bg-green-800/70 text-green-200' : 'bg-slate-700 text-slate-300'}`}>
                                    {sk.included ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                                    {sk.keyword}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                 <h1 className="text-3xl font-bold text-slate-100">Content Editor</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Craft SEO-optimized content with real-time feedback from our AI assistant.
                </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <label htmlFor="keyword-input" className="block text-sm font-medium text-slate-300 mb-2">
                            Target Keyword
                        </label>
                        <input
                            id="keyword-input"
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., 'best budget espresso machine'"
                            className="w-full bg-slate-800 p-3 text-lg text-slate-200 placeholder-slate-500 focus:outline-none rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <label htmlFor="content-textarea" className="block text-sm font-medium text-slate-300 mb-2">
                            Your Content
                        </label>
                        <textarea
                            id="content-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your article here... The analysis will appear on the right."
                            className="w-full bg-slate-800 p-3 text-base text-slate-200 placeholder-slate-500 focus:outline-none rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 min-h-[60vh] resize-y"
                        />
                    </div>
                </div>

                <AnalysisSidebar analysis={analysis} isLoading={isLoading} error={apiError} />
            </div>
        </div>
    );
};

export default ContentEditorPage;