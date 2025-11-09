import { useState, useEffect, useCallback } from 'react';
import type { Settings, Project, HistoricalAnalysis, ErrorLogEntry, SeoAnalysis, ChatMessage } from '../types';

const SETTINGS_KEY = 'SEO_ANALYZER_SETTINGS';
const MAX_HISTORY_ITEMS_PER_URL = 20;
const MAX_ERROR_LOG_ITEMS = 50;

const getDefaultSettings = (): Settings => ({
    projects: [],
    history: {},
    chatHistory: {},
    errorLog: [],
    useSearchGrounding: true, // Default to using the best data
});

const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            // Merge stored settings with defaults to handle schema changes
            const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
            return { ...getDefaultSettings(), ...parsedSettings };
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
            return getDefaultSettings();
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, [settings]);

    const addProject = useCallback((name: string, url: string) => {
        setSettings(prev => {
            if (prev.projects.some(p => p.url === url)) {
                alert("A project with this URL already exists.");
                return prev;
            }
            const newProject: Project = { name, url };
            return { ...prev, projects: [...prev.projects, newProject] };
        });
    }, []);

    const updateProject = useCallback((originalUrl: string, newName: string) => {
        setSettings(prev => ({
            ...prev,
            projects: prev.projects.map(p => p.url === originalUrl ? { ...p, name: newName } : p),
        }));
    }, []);

    const deleteProject = useCallback((urlToDelete: string) => {
        setSettings(prev => {
            const newProjects = prev.projects.filter(p => p.url !== urlToDelete);
            const newHistory = { ...prev.history };
            const newChatHistory = { ...prev.chatHistory };
            delete newHistory[urlToDelete];
            delete newChatHistory[urlToDelete];
            return { ...prev, projects: newProjects, history: newHistory, chatHistory: newChatHistory };
        });
    }, []);

    const addHistory = useCallback((analysis: SeoAnalysis, url: string, keyword: string) => {
        setSettings(prev => {
            const newRecord: HistoricalAnalysis = { timestamp: Date.now(), analysis, url, keyword };
            const urlHistory = prev.history[url] || [];
            const updatedUrlHistory = [...urlHistory, newRecord].slice(-MAX_HISTORY_ITEMS_PER_URL);
            
            const newHistory = { ...prev.history, [url]: updatedUrlHistory };
            
            // Also ensure a project exists for this URL if it's the first time
            const projectExists = prev.projects.some(p => p.url === url);
            let newProjects = prev.projects;
            if (!projectExists) {
                newProjects = [...prev.projects, { name: url, url: url }];
            }
            
            return { ...prev, history: newHistory, projects: newProjects };
        });
    }, []);

    const clearHistory = useCallback(() => {
        if (window.confirm("Are you sure you want to delete all analysis history? This action cannot be undone.")) {
            setSettings(prev => ({ ...prev, history: {} }));
        }
    }, []);
    
    const addChatMessage = useCallback((projectUrl: string, userMessage: ChatMessage, modelResponse: ChatMessage) => {
        setSettings(prev => {
            const projectChatHistory = prev.chatHistory[projectUrl] || [];
            const updatedHistory = [...projectChatHistory, userMessage, modelResponse];
            const newChatHistory = { ...prev.chatHistory, [projectUrl]: updatedHistory };
            return { ...prev, chatHistory: newChatHistory };
        });
    }, []);

    const clearChatHistory = useCallback((projectUrl: string) => {
         if (window.confirm("Are you sure you want to clear the chat history for this project?")) {
            setSettings(prev => {
                const newChatHistory = { ...prev.chatHistory };
                delete newChatHistory[projectUrl];
                return { ...prev, chatHistory: newChatHistory };
            });
        }
    }, []);
    
    const addErrorLog = useCallback((message: string, context: string) => {
        setSettings(prev => {
            const newEntry: ErrorLogEntry = { timestamp: Date.now(), message, context };
            const updatedLog = [newEntry, ...prev.errorLog].slice(0, MAX_ERROR_LOG_ITEMS);
            return { ...prev, errorLog: updatedLog };
        });
    }, []);
    
    const clearErrorLog = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the error log?")) {
            setSettings(prev => ({ ...prev, errorLog: [] }));
        }
    }, []);

    const setUseSearchGrounding = useCallback((value: boolean) => {
        setSettings(prev => ({ ...prev, useSearchGrounding: value }));
    }, []);

    return {
        settings,
        addProject,
        updateProject,
        deleteProject,
        addHistory,
        clearHistory,
        addChatMessage,
        clearChatHistory,
        addErrorLog,
        clearErrorLog,
        setUseSearchGrounding,
    };
};

export default useSettings;