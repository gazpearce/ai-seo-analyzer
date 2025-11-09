import React, { useMemo } from 'react';
import type { HistoricalAnalysis, QuickWin } from '../types';
import type { Page } from '../App';
import KPIWidget from '../components/KPIWidget';
import TrendChart from '../components/TrendChart';
import QuickWins from '../components/QuickWins';
import { rankingFactors } from '../services/rankingFactors';
import { ChartPieIcon, ArrowTrendingUpIcon, ClockIcon } from '../components/icons/Icons';

interface DashboardPageProps {
    projectName: string;
    projectHistory: HistoricalAnalysis[];
    setPage: (page: Page) => void;
}

const factorTitles = rankingFactors.reduce((acc, factor) => {
    acc[factor.id] = factor.title;
    return acc;
}, {} as Record<string, string>);


const DashboardPage: React.FC<DashboardPageProps> = ({ projectName, projectHistory, setPage }) => {

    const dashboardData = useMemo(() => {
        if (projectHistory.length === 0) {
            return {
                latestScore: 0,
                averageScore: 0,
                scoreDelta: 0,
                deltaType: 'neutral',
                scoreTrend: [],
                quickWins: [],
            };
        }

        const scores = projectHistory.map(h => h.analysis.overall.score);
        const latestScore = scores[scores.length - 1];
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        let scoreDelta = 0;
        let deltaType: 'increase' | 'decrease' | 'neutral' = 'neutral';
        if (scores.length > 1) {
            const previousScore = scores[scores.length - 2];
            const change = latestScore - previousScore;
            scoreDelta = change; 
            if (change > 0) deltaType = 'increase';
            if (change < 0) deltaType = 'decrease';
        }

        const latestAnalysis = projectHistory[projectHistory.length - 1].analysis;
        const quickWins: QuickWin[] = Object.entries(latestAnalysis)
            .map(([key, value]) => {
                if (typeof value === 'object' && value && 'status' in value && (value.status === 'Poor' || value.status === 'Needs Improvement')) {
                    return {
                        key,
                        title: factorTitles[key] || key,
                        feedback: value.feedback,
                        status: value.status,
                    };
                }
                return null;
            })
            .filter((item): item is QuickWin => item !== null)
            .sort((a, b) => (a.status === 'Poor' ? -1 : 1) - (b.status === 'Poor' ? -1 : 1))
            .slice(0, 3);
        
        return { latestScore, averageScore, scoreDelta, deltaType, scoreTrend: scores, quickWins };

    }, [projectHistory]);

    if (projectHistory.length === 0) {
        return (
             <div className="text-center py-16 px-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h1 className="text-2xl font-bold text-slate-200">Welcome to RankLens</h1>
                <p className="text-slate-400 mt-2 mb-6">No analysis has been run for this project yet.</p>
                <button
                    onClick={() => setPage('site_audit')}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors"
                >
                    Start Your First Site Audit
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-100">{projectName}</h1>
                <p className="text-slate-400">Here's a high-level overview of your project's SEO performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPIWidget 
                    title="Latest Score"
                    value={dashboardData.latestScore}
                    delta={dashboardData.scoreDelta}
                    deltaType={dashboardData.deltaType as any}
                    icon={<ClockIcon className="w-6 h-6 text-slate-400" />}
                />
                 <KPIWidget 
                    title="Average Score"
                    value={dashboardData.averageScore}
                    icon={<ChartPieIcon className="w-6 h-6 text-slate-400" />}
                />
                <KPIWidget 
                    title="Score Trend"
                    value="Improving"
                    sparklineData={dashboardData.scoreTrend}
                    icon={<ArrowTrendingUpIcon className="w-6 h-6 text-slate-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="font-semibold text-lg text-slate-200 mb-4">Overall Score History</h3>
                    <div className="h-60 text-indigo-400">
                        <TrendChart scores={dashboardData.scoreTrend} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <QuickWins wins={dashboardData.quickWins} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;