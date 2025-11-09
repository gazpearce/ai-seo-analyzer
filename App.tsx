
import React, { useState, useCallback, useEffect } from 'react';
import type { SeoAnalysis, HistoricalAnalysis, CompetitorAnalysis, KeywordIdea, ContentAnalysis, Command, ContentBrief } from './types';
import { analyzeSeo, exploreKeywords, analyzeContentRealtime, parseUserCommand, generateContentBrief } from './services/geminiService';
import { fetchPageContent } from './services/pageFetcher';
import useSettings from './hooks/useSettings';

import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SiteAuditPage from './pages/SiteAuditPage';
import ReportsPage from './pages/ReportsPage';
import MethodologyPage from './pages/MethodologyPage';
import KeywordExplorerPage from './pages/KeywordExplorerPage';
import AiChatPage from './pages/AiChatPage';
import ContentEditorPage from './pages/ContentEditorPage';
import SettingsPage from './pages/SettingsPage';
import CommandBar from './components/CommandBar';
import ContentBriefGeneratorPage from './pages/ContentBriefGeneratorPage';
import BacklinksPage from './pages/BacklinksPage';


export type Page = 'dashboard' | 'site_audit' | 'reports' | 'backlinks' | 'methodology' | 'keyword_explorer' | 'content_editor' | 'content_brief_generator' | 'ai_chat' | 'settings';

const App: React.FC = () => {
  // Global State using custom hook for persistence
  const { settings, addProject, updateProject, deleteProject, addHistory, clearHistory, addChatMessage, clearChatHistory, addErrorLog, clearErrorLog, setUseSearchGrounding } = useSettings();
  const [selectedProjectUrl, setSelectedProjectUrl] = useState<string | null>(null);

  // Page and View Management
  const [page, setPage] = useState<Page>('dashboard');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  
  // Analysis-specific State
  const [currentAnalysis, setCurrentAnalysis] = useState<{ analysis: SeoAnalysis; url: string; keyword: string } | null>(null);
  const [competitorAnalyses, setCompetitorAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [keywordIdeas, setKeywordIdeas] = useState<KeywordIdea[]>([]);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [contentBrief, setContentBrief] = useState<ContentBrief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  useEffect(() => {
    if (settings.projects.length > 0 && !selectedProjectUrl) {
      setSelectedProjectUrl(settings.projects[0].url);
    } else if (settings.projects.length > 0 && selectedProjectUrl && !settings.projects.find(p => p.url === selectedProjectUrl)) {
      // If the selected project was deleted, select the first one
      setSelectedProjectUrl(settings.projects[0].url);
    } else if (settings.projects.length === 0) {
      setSelectedProjectUrl(null);
    }
  }, [settings.projects, selectedProjectUrl]);
  
  const handleAnalyze = useCallback(async (
    url: string,
    competitorUrls: string[],
    pageContent: string,
    keyword: string,
    useGoogleSearch: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(null);
    setCompetitorAnalyses([]);
    setKeywordIdeas([]);
    setContentAnalysis(null);

    const allUrlsToAnalyze = [url, ...competitorUrls].filter(u => u.trim() !== '');
    if (allUrlsToAnalyze.length === 0 && !pageContent.trim()) {
        const err = "Please provide at least one URL or some page content to analyze.";
        setError(err);
        addErrorLog(err, 'Validation');
        setIsLoading(false);
        return;
    }

    try {
        let primaryAnalysisResult: SeoAnalysis | null = null;
        const competitorAnalysisResults: CompetitorAnalysis[] = [];
        let fetchErrorOccurred = false;

        if (useGoogleSearch) {
          setLoadingMessage('Fetching latest SEO trends from the web...');
        }

        for (let i = 0; i < allUrlsToAnalyze.length; i++) {
            const currentUrl = allUrlsToAnalyze[i];
            setLoadingMessage(`Analyzing ${i + 1}/${allUrlsToAnalyze.length}: ${currentUrl}`);
            
            let contentToAnalyze = '';
            if (i === 0 && pageContent.trim()) {
              contentToAnalyze = pageContent;
            } else {
              try {
                  setLoadingMessage(`Fetching content for ${currentUrl}...`);
                  contentToAnalyze = await fetchPageContent(currentUrl);
              } catch (fetchErr: any) {
                  console.error(fetchErr);
                  fetchErrorOccurred = true;
                  const userMessage = `Error fetching ${currentUrl}: The URL might be invalid, temporarily down, or blocking requests. For the primary URL, you can try pasting its content directly into the text area as a workaround.`;
                  setError(prev => (prev ? `${prev}\n\n` : '') + userMessage);
                  addErrorLog(fetchErr.message, `Fetch ${currentUrl}`);
                  continue;
              }
            }

            setLoadingMessage(`Running Gemini analysis for ${currentUrl}...`);
            const result = await analyzeSeo({ url: currentUrl, content: contentToAnalyze, keyword, useGoogleSearch });
            addHistory(result, currentUrl, keyword);

            if (i === 0) {
                primaryAnalysisResult = result;
            } else {
                competitorAnalysisResults.push({ ...result, url: currentUrl });
            }
        }
        
        if (allUrlsToAnalyze.length === 0 && pageContent.trim()) {
            setLoadingMessage('Analyzing pasted content with Gemini...');
            const resultUrl = 'pasted_content';
            primaryAnalysisResult = await analyzeSeo({ url: resultUrl, content: pageContent, keyword, useGoogleSearch });
            addHistory(primaryAnalysisResult, resultUrl, keyword);
        }

        if (primaryAnalysisResult) {
          setCurrentAnalysis({ analysis: primaryAnalysisResult, url: url || 'pasted_content', keyword });
          setCompetitorAnalyses(competitorAnalysisResults);
        } else if (allUrlsToAnalyze.length > 0 && !fetchErrorOccurred) {
          const err = "The primary URL could not be analyzed. Please check the URL and try again.";
          setError(err);
          addErrorLog(err, 'Primary URL Analysis');
        }

    } catch (err: any) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(prev => (prev ? `${prev}\n` : '') + errorMessage);
      addErrorLog(err.message, 'Site Audit');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [addHistory, addErrorLog]);

  const handleExploreKeywords = useCallback(async (seedKeyword: string) => {
    setIsLoading(true);
    setError(null);
    setKeywordIdeas([]);
    setCurrentAnalysis(null);
    setCompetitorAnalyses([]);
    setContentAnalysis(null);
    setLoadingMessage(`Finding keywords related to "${seedKeyword}"...`);
    
    try {
        const results = await exploreKeywords(seedKeyword);
        setKeywordIdeas(results);
    } catch (err: any) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        addErrorLog(err.message, 'Keyword Explorer');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [addErrorLog]);

  const handleAnalyzeContent = useCallback(async (content: string, keyword: string) => {
    setError(null);
    try {
        const result = await analyzeContentRealtime(content, keyword);
        setContentAnalysis(result);
        return result;
    } catch (err: any) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        addErrorLog(err.message, 'Content Editor');
        return null;
    }
  }, [addErrorLog]);
  
  const handleGenerateBrief = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setContentBrief(null);
    setLoadingMessage(`Generating content brief for "${topic}"...`);
    
    try {
        const result = await generateContentBrief(topic);
        setContentBrief(result);
    } catch (err: any) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        addErrorLog(err.message, 'Content Brief Generator');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [addErrorLog]);

  const handleCommand = useCallback(async (command: Command) => {
    setIsCommandBarOpen(false);
    switch (command.action) {
        case 'audit':
            setPage('site_audit');
            // Use default setting for search grounding when using command bar
            handleAnalyze(command.parameters.url || '', [], '', command.parameters.keyword || '', settings.useSearchGrounding);
            break;
        case 'keywords':
            setPage('keyword_explorer');
            handleExploreKeywords(command.parameters.keyword || '');
            break;
        default:
            const err = `Unknown command action: ${command.action}`;
            setError(err);
            addErrorLog(err, 'Command Bar');
    }
  }, [handleAnalyze, handleExploreKeywords, addErrorLog, settings.useSearchGrounding]);
  
  const handleSelectHistoryItem = (record: HistoricalAnalysis) => {
    setCurrentAnalysis({ analysis: record.analysis, url: record.url, keyword: record.keyword });
    setCompetitorAnalyses([]);
    setPage('site_audit');
  };
  
  const renderPage = () => {
    const projectHistory = selectedProjectUrl ? settings.history[selectedProjectUrl] || [] : [];
    const projectChatHistory = selectedProjectUrl ? settings.chatHistory[selectedProjectUrl] || [] : [];
    const projectName = settings.projects.find(p => p.url === selectedProjectUrl)?.name || selectedProjectUrl || 'No Project Selected';

    switch (page) {
      case 'dashboard':
        return <DashboardPage 
          projectHistory={projectHistory}
          projectName={projectName}
          setPage={setPage}
        />;
      case 'site_audit':
        return <SiteAuditPage 
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          error={error}
          loadingMessage={loadingMessage}
          analysisResult={currentAnalysis}
          competitorAnalyses={competitorAnalyses}
          useSearchGroundingDefault={settings.useSearchGrounding}
          key={currentAnalysis?.url} 
        />;
      case 'reports':
        return <ReportsPage
          history={settings.history}
          onSelectAnalysis={handleSelectHistoryItem}
          onClearHistory={clearHistory}
        />;
      case 'backlinks':
        return <BacklinksPage />;
      case 'methodology':
        return <MethodologyPage />;
      case 'keyword_explorer':
        return <KeywordExplorerPage 
          onExplore={handleExploreKeywords}
          isLoading={isLoading}
          error={error}
          results={keywordIdeas}
        />;
       case 'content_editor':
        return <ContentEditorPage
            onAnalyzeContent={handleAnalyzeContent}
            initialAnalysis={contentAnalysis}
            apiError={error}
        />;
      case 'content_brief_generator':
        return <ContentBriefGeneratorPage
            onGenerate={handleGenerateBrief}
            isLoading={isLoading}
            error={error}
            brief={contentBrief}
        />;
      case 'ai_chat':
        return <AiChatPage
          projectName={projectName}
          projectUrl={selectedProjectUrl}
          projectHistory={projectHistory}
          persistedHistory={projectChatHistory}
          onAddChatMessage={addChatMessage}
          onClearHistory={() => selectedProjectUrl && clearChatHistory(selectedProjectUrl)}
        />;
      case 'settings':
        return <SettingsPage 
          settings={settings}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onClearErrorLog={clearErrorLog}
          onSetUseSearchGrounding={setUseSearchGrounding}
        />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <>
      <MainLayout
        page={page}
        setPage={setPage}
        projects={settings.projects}
        selectedProjectUrl={selectedProjectUrl}
        setSelectedProjectUrl={setSelectedProjectUrl}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
      >
        {renderPage()}
      </MainLayout>
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onCommand={handleCommand}
        parseCommand={parseUserCommand}
      />
    </>
  );
};

export default App;
