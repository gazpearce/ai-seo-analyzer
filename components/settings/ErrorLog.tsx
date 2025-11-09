import React, { useState } from 'react';
import type { ErrorLogEntry } from '../../types';
import { DocumentDuplicateIcon, TrashIcon, CheckCircleIcon } from '../icons/Icons';

interface ErrorLogProps {
    errorLog: ErrorLogEntry[];
    onClearErrorLog: () => void;
}

const ErrorLog: React.FC<ErrorLogProps> = ({ errorLog, onClearErrorLog }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        const logText = errorLog
            .map(entry => `[${new Date(entry.timestamp).toISOString()}] [${entry.context}] ${entry.message}`)
            .join('\n');
        navigator.clipboard.writeText(logText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">Error Log</h2>
                    <p className="text-slate-400 text-sm mt-1">Recent application errors are logged here for debugging.</p>
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={handleCopy}
                        disabled={isCopied}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/60 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-60"
                    >
                        {isCopied ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <DocumentDuplicateIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied!' : 'Copy for Support'}
                    </button>
                    <button
                        onClick={onClearErrorLog}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-900/50 border border-red-800 rounded-md hover:bg-red-900 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Clear Log
                    </button>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-96 overflow-y-auto">
                {errorLog.length > 0 ? (
                     <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                        {errorLog.map(entry => (
                             <div key={entry.timestamp} className="border-b border-slate-700/50 py-2">
                                <span className="text-cyan-400">[{new Date(entry.timestamp).toLocaleString()}]</span>
                                <span className="text-yellow-400"> [{entry.context}]</span>
                                <span className="text-slate-300"> - {entry.message}</span>
                            </div>
                        ))}
                    </pre>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">No errors logged. All systems nominal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorLog;
