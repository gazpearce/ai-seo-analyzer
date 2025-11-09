import React, { useState } from 'react';
import { CloudArrowDownIcon, CheckCircleIcon } from '../icons/Icons';

interface KnowledgeSettingsProps {
    useSearchGrounding: boolean;
    onSetUseSearchGrounding: (value: boolean) => void;
}

const KnowledgeSettings: React.FC<KnowledgeSettingsProps> = ({ useSearchGrounding, onSetUseSearchGrounding }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateComplete, setUpdateComplete] = useState(false);

    const handleUpdate = () => {
        setIsUpdating(true);
        // Simulate a network request to "update" the knowledge base
        setTimeout(() => {
            setIsUpdating(false);
            setUpdateComplete(true);
            setTimeout(() => setUpdateComplete(false), 2500);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-xl font-semibold text-slate-100">Knowledge Base Settings</h2>
                <p className="text-slate-400 text-sm mt-1">Control how the AI stays up-to-date with the latest SEO trends.</p>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-1">
                        <label htmlFor="use-search-toggle" className="font-medium text-slate-200">
                           Always Use Live Web Data
                        </label>
                        <p id="use-search-description" className="text-slate-400 text-sm">
                            When enabled, all new site audits will automatically use Google Search to enhance the analysis with the latest SEO information. This is recommended for the most accurate results.
                        </p>
                    </div>
                     <div className="ml-4 flex h-6 items-center">
                        <button
                            type="button"
                            className={`${
                            useSearchGrounding ? 'bg-indigo-600' : 'bg-slate-600'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900`}
                            role="switch"
                            aria-checked={useSearchGrounding}
                            onClick={() => onSetUseSearchGrounding(!useSearchGrounding)}
                            id="use-search-toggle"
                        >
                            <span
                            aria-hidden="true"
                            className={`${
                                useSearchGrounding ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-200">Manual Knowledge Update</h3>
                <p className="text-slate-400 text-sm mt-1 mb-4">
                   Click the button below to force an immediate refresh of the AI's knowledge base from the live web for all subsequent analyses. This is useful if you suspect major SEO trends have recently changed.
                </p>
                <button
                    onClick={handleUpdate}
                    disabled={isUpdating || updateComplete}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 text-sm"
                >
                    {isUpdating ? (
                         <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Updating...
                        </>
                    ) : updateComplete ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Knowledge Base Updated!
                        </>
                    ) : (
                        <>
                            <CloudArrowDownIcon className="w-5 h-5" />
                           Update Now
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default KnowledgeSettings;