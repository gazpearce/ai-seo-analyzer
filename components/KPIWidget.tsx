import React from 'react';
import TrendChart from './TrendChart';

interface KPIWidgetProps {
    title: string;
    value: string | number;
    delta?: number;
    deltaType?: 'increase' | 'decrease' | 'neutral';
    sparklineData?: number[];
    icon: React.ReactNode;
}

const getDeltaStyles = (type: 'increase' | 'decrease' | 'neutral' = 'neutral') => {
    switch (type) {
        case 'increase': return 'text-green-400';
        case 'decrease': return 'text-red-400';
        default: return 'text-slate-400';
    }
};

const KPIWidget: React.FC<KPIWidgetProps> = ({ title, value, delta, deltaType, sparklineData, icon }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full shadow-lg">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="font-medium text-sm text-slate-400">{title}</h3>
            </div>
            <div className="flex items-end justify-between mt-auto">
                <div>
                    <p className="text-3xl font-bold text-slate-50">{value}</p>
                    {delta !== undefined && (
                        <p className={`text-sm font-medium ${getDeltaStyles(deltaType)}`}>
                            {delta > 0 ? '+' : ''}{delta}{deltaType !== 'neutral' ? '%' : ''} vs last period
                        </p>
                    )}
                </div>
                {sparklineData && sparklineData.length > 1 && (
                    <div className="w-24 h-10 text-slate-500">
                        <TrendChart scores={sparklineData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPIWidget;
