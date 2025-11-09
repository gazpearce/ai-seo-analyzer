import React, { useState, useEffect } from 'react';
import { XCircleIcon, SparklesIcon } from './icons/Icons';

interface SeoInputProps {
  onAnalyze: (url: string, competitorUrls: string[], pageContent: string, keyword: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  initialKeyword?: string;
  useSearch: boolean;
  setUseSearch: (value: boolean) => void;
}

const MAX_COMPETITORS = 3;

const SeoInput: React.FC<SeoInputProps> = ({ 
  onAnalyze, isLoading,
  initialUrl = '',
  initialKeyword = '',
  useSearch,
  setUseSearch,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [pageContent, setPageContent] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // When a historical analysis is loaded, parent component will re-mount this with new initial props
    setUrl(initialUrl);
    setKeyword(initialKeyword);
  }, [initialUrl, initialKeyword]);

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString) return true; // Allow empty strings
    try {
        new URL(urlString);
        return true;
    } catch (_) {
        return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isUrlPresent = url.trim() !== '';
    const isContentPresent = pageContent.trim() !== '';

    if (!isUrlPresent && !isContentPresent) {
      setValidationError('Please provide a primary URL or paste page content to analyze.');
      return;
    }
    
    const allUrls = [url, ...competitorUrls];
    const invalidUrl = allUrls.find(u => u.trim() !== '' && !isValidUrl(u));
    if (invalidUrl) {
        setValidationError(`The URL "${invalidUrl}" is not valid. Please correct it.`);
        return;
    }

    setValidationError(null);
    onAnalyze(url, competitorUrls, pageContent, keyword);
  };

  const handleCompetitorUrlChange = (index: number, value: string) => {
    const newCompetitors = [...competitorUrls];
    newCompetitors[index] = value;
    setCompetitorUrls(newCompetitors);
  };

  const addCompetitor = () => {
    if (competitorUrls.length < MAX_COMPETITORS) {
        setCompetitorUrls([...competitorUrls, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = competitorUrls.filter((_, i) => i !== index);
    setCompetitorUrls(newCompetitors);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg" noValidate>
      <div>
        <label htmlFor="url-input" className="block text-sm font-medium text-slate-300 mb-2">
          Primary Website URL
        </label>
        <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            id="url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full flex-1 bg-transparent p-3 text-lg text-slate-200 placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
            Competitor URLs (optional)
        </label>
        {competitorUrls.map((compUrl, index) => (
            <div key={index} className="flex items-center gap-2">
                <input
                    type="url"
                    value={compUrl}
                    onChange={(e) => handleCompetitorUrlChange(index, e.target.value)}
                    placeholder={`https://competitor-${index + 1}.com`}
                    className="w-full flex-1 bg-slate-800 p-2 text-md text-slate-200 placeholder-slate-500 focus:outline-none rounded-md border border-slate-700 focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button type="button" onClick={() => removeCompetitor(index)} className="p-1 text-slate-500 hover:text-red-400" aria-label="Remove competitor">
                    <XCircleIcon className="w-6 h-6"/>
                </button>
            </div>
        ))}
        {competitorUrls.length < MAX_COMPETITORS && (
            <button type="button" onClick={addCompetitor} disabled={isLoading} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50">
                + Add Competitor
            </button>
        )}
      </div>


      <div>
        <label htmlFor="keyword-input" className="block text-sm font-medium text-slate-300 mb-2">
          Primary Keyword / Goal (optional)
        </label>
        <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            id="keyword-input" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., 'best electric bikes 2026'"
            className="w-full flex-1 bg-transparent p-3 text-lg text-slate-200 placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-800 px-2 text-sm text-slate-500">OR</span>
        </div>
      </div>

      <div>
        <label htmlFor="content-input" className="block text-sm font-medium text-slate-300 mb-2">
          Paste Page Content (for Primary URL)
        </label>
        <textarea
          id="content-input" value={pageContent} onChange={(e) => setPageContent(e.target.value)}
          placeholder="Pasting content overrides the URL fetcher for the primary URL, ensuring a more accurate on-page analysis."
          rows={6}
          className="w-full bg-slate-800 p-3 text-base text-slate-200 placeholder-slate-500 focus:outline-none rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
      </div>

      <div className="pt-2 border-t border-slate-800">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="use-search"
                aria-describedby="use-search-description"
                name="use-search"
                type="checkbox"
                checked={useSearch}
                onChange={(e) => setUseSearch(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="use-search" className="font-medium text-slate-200">
                Use Live Web Data
              </label>
              <p id="use-search-description" className="text-slate-400">
                Enhance analysis with real-time data from Google Search for more accurate, up-to-date recommendations. (May be slightly slower)
              </p>
            </div>
          </div>
      </div>


      <div className="pt-2">
        <button
          type="submit" disabled={isLoading}
          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 flex items-center justify-center gap-2 text-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5"/>
              <span>Analyze SEO</span>
            </div>
          )}
        </button>
      </div>

      {validationError && (
        <p id="form-error" className="mt-2 text-sm text-red-400 text-center" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
};

export default SeoInput;