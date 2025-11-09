import React from 'react';
import type { SeoAnalysis, PageSpeedMetric } from '../types';
import { CpuChipIcon } from './icons/Icons';

interface PageSpeedInsightsProps {
  data: SeoAnalysis['pageSpeed'];
  url: string;
}

const getStatusColor = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
  if (status === 'Good') return 'text-green-400';
  if (status === 'Needs Improvement') return 'text-yellow-400';
  return 'text-red-400';
};

const getStatusBgColor = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
  if (status === 'Good') return 'bg-green-500/10 border-green-500/30';
  if (status === 'Needs Improvement') return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-red-500/10 border-red-500/30';
};

const getStatusIndicator = (status: 'Good' | 'Needs Improvement' | 'Poor') => {
    const colorClass = getStatusColor(status).replace('text-', 'bg-');
    return <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>;
}


const MetricRow: React.FC<{ name: string; description: string; data: PageSpeedMetric }> = ({ name, description, data }) => {
    const styles = getStatusColor(data.status);
    return (
        <div className={`p-4 rounded-lg bg-slate-800/70 border border-slate-700`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                    <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                         {getStatusIndicator(data.status)}
                        {name}
                    </h4>
                    <p className="text-xs text-slate-400 hidden md:block">{description}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-sm text-slate-300">{data.feedback}</p>
                </div>
                <div className="md:col-span-1 text-left md:text-right">
                    <p className={`text-2xl font-bold ${styles}`}>{data.value}</p>
                    <p className="text-xs text-slate-400">Score: {data.score}</p>
                </div>
            </div>
        </div>
    );
};


const PageSpeedInsights: React.FC<PageSpeedInsightsProps> = ({ data, url }) => {
  const { score, status, feedback, core_web_vitals, other_metrics } = data;

  return (
    <section>
      <div className="border-b border-slate-700 pb-2 mb-6 flex items-center gap-3">
        <CpuChipIcon className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-semibold text-slate-200">Page Speed Insights (Core Web Vitals)</h2>
      </div>
      <div className={`bg-slate-800/50 border rounded-xl p-6 ${getStatusBgColor(status)}`}>
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
            <div>
                <h3 className="font-semibold text-slate-100">Overall Performance Score</h3>
                <p className="text-sm text-slate-300">{feedback}</p>
            </div>
            <p className="font-bold text-3xl">
              <span className={getStatusColor(status)}>{score}/100</span>
            </p>
        </div>
        
         {url && url.startsWith('http') && (
            <a
                href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 group"
            >
                Analyze with Google PageSpeed Insights for live data
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </a>
        )}
        
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Core Web Vitals</h4>
                <div className="space-y-3">
                    <MetricRow name="LCP" description="Largest Contentful Paint" data={core_web_vitals.lcp} />
                    <MetricRow name="INP" description="Interaction to Next Paint" data={core_web_vitals.inp} />
                    <MetricRow name="CLS" description="Cumulative Layout Shift" data={core_web_vitals.cls} />
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Other Metrics</h4>
                <div className="space-y-3">
                    <MetricRow name="FCP" description="First Contentful Paint" data={other_metrics.fcp} />
                    <MetricRow name="TTFB" description="Time to First Byte" data={other_metrics.ttfb} />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default PageSpeedInsights;