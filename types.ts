// types.ts

// Basic building block for a single SEO factor analysis
export interface SeoFactor {
  score: number;
  status: 'Good' | 'Needs Improvement' | 'Poor';
  feedback: string;
}

// For page speed metrics which have a value string
export interface PageSpeedMetric extends SeoFactor {
  value: string;
}

// For Internal Linking Analysis
export interface AnalyzedLink {
    anchorText: string;
    url: string;
    feedback: string;
    status: 'Good' | 'Needs Improvement' | 'Poor';
}

// For the AI-Powered Content Brief Generator
export interface ContentBriefOutlineItem {
    title: string; // H2
    subheadings: string[]; // H3s
}

export interface ContentBrief {
    suggestedTitle: string;
    suggestedMetaDescription: string;
    targetWordCount: number;
    targetReadabilityGrade: number;
    outline: ContentBriefOutlineItem[];
    questionsToAnswer: string[];
    semanticKeywords: string[];
    toneOfVoice: string;
    uniqueAngleSuggestion: string;
}

export interface KeywordCluster {
  clusterName: string;
  keywords: KeywordIdea[];
}

export interface QuickWin {
    key: string;
    title: string;
    feedback: string;
    status: 'Poor' | 'Needs Improvement';
}


// The main, comprehensive SEO analysis structure
export interface SeoAnalysis {
  overall: SeoFactor & { summary: string };
  title: SeoFactor;
  metaDescription: SeoFactor;
  headings: SeoFactor & {
    h1_count: number;
    h2_count: number;
    h3_count: number;
    average_paragraph_length: number;
    long_paragraphs_count: number;
  };
  contentKeywords: SeoFactor & { top_keywords: string[] };
  imageSeo: SeoFactor & {
    images_missing_alt: number;
    images_missing_alt_details: {
      src: string;
      suggested_alt: string;
    }[];
  };
  mobileFriendly: SeoFactor;
  pageSpeed: SeoFactor & {
    core_web_vitals: {
        lcp: PageSpeedMetric;
        inp: PageSpeedMetric;
        cls: PageSpeedMetric;
    };
    other_metrics: {
        fcp: PageSpeedMetric;
        ttfb: PageSpeedMetric;
    };
  };
  structuredData: SeoFactor;
  security: SeoFactor;
  accessibility: SeoFactor;
  e_e_a_t: SeoFactor;
  llmReadiness: SeoFactor;
  linkHealth: SeoFactor;
  urlStructure: SeoFactor;
  readability: SeoFactor;
  ctaEffectiveness: SeoFactor;
  backlinkProfile: SeoFactor;
  brandSignals: SeoFactor;
  indexability: SeoFactor;
  xmlSitemap: SeoFactor;
  userIntentMatch: SeoFactor;
  contentFreshness: SeoFactor;
  internalLinking: SeoFactor & {
    goodLinkCount: number;
    badLinkCount: number;
    links: AnalyzedLink[];
  };
  googleBusinessProfile: SeoFactor;
  napConsistency: SeoFactor;
  localReviews: SeoFactor;
  metaTagOptimization: SeoFactor & {
    suggested_keywords: string[];
  };
}

// The SeoAnalysis type with an added URL, used for competitors
export interface CompetitorAnalysis extends SeoAnalysis {
  url: string;
}

// Type for keyword ideas from the explorer
export interface KeywordIdea {
  keyword: string;
  volume: number;
  difficulty: 'Low' | 'Medium' | 'High';
  intent: 'Informational' | 'Commercial' | 'Navigational' | 'Transactional';
}

// Type for the real-time content editor analysis
export interface ContentAnalysis {
    overallScore: number;
    readabilityGrade: number;
    wordCount: number;
    keywordChecklist: {
        inHeadline: { met: boolean; feedback: string };
        inSubheading: { met: boolean; feedback:string };
        inFirstParagraph: { met: boolean; feedback: string };
        density: { score: number; feedback: string };
    };
    semanticKeywords: {
        keyword: string;
        included: boolean;
    }[];
    overallFeedback: string;
}

// Type for commands from the command bar
export interface Command {
    action: 'audit' | 'keywords' | 'unknown';
    parameters: {
        url?: string;
        keyword?: string;
    };
}

// For project management
export interface Project {
  name: string;
  url: string;
}

// For storing historical analysis records
export interface HistoricalAnalysis {
  timestamp: number;
  analysis: SeoAnalysis;
  url: string;
  keyword: string;
}

// For chat messages
export interface ChatMessagePart {
    text: string;
}
export interface ChatMessage {
    role: 'user' | 'model';
    parts: ChatMessagePart[];
}


// For storing error logs
export interface ErrorLogEntry {
  timestamp: number;
  message: string;
  context: string;
}

// For project files uploaded by the user
export interface ProjectFile {
    path: string;
    content: string;
}

// The main settings object stored in localStorage
export interface Settings {
  projects: Project[];
  history: Record<string, HistoricalAnalysis[]>;
  chatHistory: Record<string, ChatMessage[]>;
  errorLog: ErrorLogEntry[];
  useSearchGrounding: boolean;
}

// A utility type to get keys of SeoAnalysis that have a 'score' property
export type AnalysisKeyWithScore = {
  [K in keyof SeoAnalysis]: SeoAnalysis[K] extends { score: number } ? K : never;
}[keyof SeoAnalysis];