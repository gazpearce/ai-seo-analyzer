import { GoogleGenAI, Type } from '@google/genai';
import type { SeoAnalysis, KeywordIdea, ContentAnalysis, Command, ContentBrief, KeywordCluster } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLatestSeoTrends = async (): Promise<string> => {
    const prompt = "Based on the latest data from Google Search, provide a concise summary of the top 5 most critical SEO ranking factors for this year. Include brief explanations for each.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching latest SEO trends:", error);
        // Return a neutral message that won't disrupt the main analysis if it fails.
        return "Could not fetch latest SEO trends. Proceeding with standard analysis.";
    }
};

const commandParserSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            description: "The user's primary intent. Must be one of: 'audit', 'keywords', or 'unknown'."
        },
        parameters: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "The target URL, if mentioned. Must be a fully qualified URL." },
                keyword: { type: Type.STRING, description: "The target keyword or topic, if mentioned." },
            },
        },
    },
    required: ['action', 'parameters'],
};

const pageSpeedMetricSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Actionable feedback for this specific metric." },
        value: { type: Type.STRING, description: "The estimated value for this metric (e.g., '2.1s', '150ms', '0.08')." }
    },
    required: ['score', 'status', 'feedback', 'value'],
};


const seoAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overall: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Overall SEO score from 0-100." },
        status: { type: Type.STRING, description: "Overall status: 'Good', 'Needs Improvement', or 'Poor'." },
        feedback: { type: Type.STRING, description: "One-sentence overall feedback." },
        summary: { type: Type.STRING, description: "A 2-3 sentence summary of the key findings and most important recommendations." }
      },
    },
    title: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Feedback on title tag length, keyword usage, and clarity." },
      },
    },
    metaDescription: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Feedback on meta description length, clarity, and call-to-action." },
      },
    },
    headings: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analysis of heading structure (H1, H2, H3 counts) and paragraph length for readability. Provide feedback on logical hierarchy and concise paragraphs." },
        h1_count: { type: Type.INTEGER, description: "Number of H1 tags found." },
        h2_count: { type: Type.INTEGER, description: "Number of H2 tags found." },
        h3_count: { type: Type.INTEGER, description: "Number of H3 tags found." },
        average_paragraph_length: { type: Type.INTEGER, description: "Average number of words per paragraph." },
        long_paragraphs_count: { type: Type.INTEGER, description: "Count of paragraphs considered too long for good web readability (e.g., > 150 words)." },
      },
    },
    contentKeywords: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analysis of main content for keyword relevance and density." },
        top_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of top 3-5 relevant keywords identified in the content." },
      },
    },
    imageSeo: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "A summary of image SEO. Is alt text generally used well? Give overall advice." },
        images_missing_alt: { type: Type.INTEGER, description: "Count of images missing alt text." },
        images_missing_alt_details: {
            type: Type.ARRAY,
            description: "A list of images missing alt text, along with an AI-generated suggestion for each.",
            items: {
                type: Type.OBJECT,
                properties: {
                    src: { type: Type.STRING, description: "The src attribute of the image tag." },
                    suggested_alt: { type: Type.STRING, description: "A descriptive, keyword-aware alt text suggestion for the image." }
                },
                required: ['src', 'suggested_alt']
            }
        }
      },
    },
    mobileFriendly: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analysis of mobile friendliness, responsive design, and content readability on small screens." },
      },
    },
    pageSpeed: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Provide a detailed, HYPOTHETICAL analysis of page speed based on Google's Core Web Vitals. From the provided HTML, infer potential issues. For LCP, look for large above-the-fold images or blocks. For INP, consider heavy scripts that might block the main thread. For CLS, look for images without dimensions or dynamically injected content. Give a general assessment based on best practices. This overall feedback should summarize the key performance bottlenecks." },
            core_web_vitals: {
                type: Type.OBJECT,
                properties: {
                    lcp: pageSpeedMetricSchema,
                    inp: pageSpeedMetricSchema,
                    cls: pageSpeedMetricSchema
                }
            },
            other_metrics: {
                type: Type.OBJECT,
                properties: {
                    fcp: pageSpeedMetricSchema,
                    ttfb: pageSpeedMetricSchema
                }
            }
        },
    },
    structuredData: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analysis of Schema.org JSON-LD structured data. Check for presence, validity, and richness. If none is found, recommend adding it." },
      },
    },
    security: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analysis of security signals like HTTPS and presence of privacy policy links." },
      },
    },
    accessibility: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Conceptual analysis of web accessibility (WCAG), checking for semantic HTML, ARIA labels, and descriptive link text." },
      },
    },
    e_e_a_t: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Evaluate for signals of Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T). Look for author bios, cited sources, unique data, and clear contact information." },
      },
    },
    llmReadiness: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analyze content for clarity, structure, and directness, assessing its suitability for AI summarization (like in Google AI Overviews)." },
      },
    },
    linkHealth: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Conceptually analyze internal and external links found in the content. Are anchor texts descriptive? Are there signs of broken links?" },
      },
    },
    urlStructure: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Based on the provided URL, assess its SEO friendliness. Is it readable, concise, and does it use keywords? If no URL, score 0." },
      },
    },
    readability: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analyze the text for readability, considering sentence length, use of whitespace, and formatting. Provide actionable advice." },
      },
    },
    ctaEffectiveness: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analyze the presence and quality of Calls to Action (CTAs). Are they clear, compelling, and easy to find?" },
      },
    },
    // OFF-PAGE
    backlinkProfile: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Perform a HYPOTHETICAL analysis of the page's backlink profile. Based on the URL and topic, what would a good backlink profile look like? Mention the importance of high-authority, relevant domains and natural anchor text. Give actionable advice on link building." },
      },
    },
    brandSignals: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Perform a HYPOTHETICAL analysis of brand signals. Discuss the importance of unlinked brand mentions and branded search volume as trust signals for Google. Provide strategies to increase brand presence online." },
        },
    },
    // ADVANCED TECHNICAL
    indexability: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Analyze the provided content for common indexability issues. Check for 'noindex' meta tags or canonical tags pointing elsewhere. Discuss the role of robots.txt in crawl management. Provide clear advice on ensuring the page is crawlable and indexable." },
        },
    },
    xmlSitemap: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Provide a HYPOTHETICAL assessment of XML sitemap best practices. Emphasize the importance of having a clean, up-to-date sitemap submitted to Google Search Console for efficient content discovery." },
        },
    },
    // DEEPER CONTENT
    userIntentMatch: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Based on the keyword and content, analyze how well the page matches user intent (informational, navigational, commercial, transactional). Provide feedback on whether the content format and depth align with what a user would expect." },
        },
    },
    contentFreshness: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Evaluate the topic's need for freshness. For time-sensitive topics, assess if the content appears up-to-date. Provide recommendations on how often content on this topic should be reviewed and updated to maintain relevance." },
        },
    },
    internalLinking: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "A summary of the internal linking strategy. Evaluate if links help establish topical authority and distribute link equity. Suggest ways to improve the internal linking strategy to boost SEO." },
        goodLinkCount: { type: Type.INTEGER, description: "The number of internal links considered good." },
        badLinkCount: { type: Type.INTEGER, description: "The number of internal links that need improvement (e.g., poor anchor text, irrelevant target)." },
        links: {
            type: Type.ARRAY,
            description: "A detailed analysis of each internal link found in the content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    anchorText: { type: Type.STRING, description: "The anchor text of the link." },
                    url: { type: Type.STRING, description: "The href attribute of the link." },
                    feedback: { type: Type.STRING, description: "Specific feedback on this link's anchor text and relevance." },
                    status: { type: Type.STRING, description: "'Good', 'Needs Improvement', or 'Poor'." }
                },
                required: ['anchorText', 'url', 'feedback', 'status']
            }
        }
      },
    },
    // LOCAL SEO
    googleBusinessProfile: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "If the keyword or URL suggests a local business, provide a HYPOTHETICAL analysis of Google Business Profile (GBP) optimization. Discuss the importance of a complete profile, regular posts, and responding to Q&As." },
        },
    },
    napConsistency: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "If a local business is implied, explain the critical importance of NAP (Name, Address, Phone) consistency across the web. Discuss how consistent citations build trust with search engines. Give a general score." },
        },
    },
    localReviews: {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "For local queries, provide a HYPOTHETICAL analysis of local review signals. Discuss the impact of review quantity, velocity, and owner responses on local search rankings. Suggest strategies for encouraging customer reviews." },
        },
    },
    metaTagOptimization: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        status: { type: Type.STRING },
        feedback: { type: Type.STRING, description: "Analyze the meta keywords tag. State its modern SEO value (low for Google, but can be used by other systems). If it's stuffed or irrelevant, recommend removing it. If it's absent, suggest adding a concise list of 5-7 highly relevant keywords derived from the content. If it's good, say so." },
        suggested_keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 5-7 suggested keywords for the meta tag if it's missing or can be improved. If the tag should be removed, return an empty array."
        }
      },
    },
  },
};

const keywordExplorerSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            keyword: { type: Type.STRING, description: "The generated keyword idea." },
            volume: { type: Type.INTEGER, description: "Estimated monthly search volume (e.g., 1200)." },
            difficulty: { type: Type.STRING, description: "SEO difficulty to rank for this keyword ('Low', 'Medium', 'High')." },
            intent: { type: Type.STRING, description: "The likely user intent ('Informational', 'Commercial', 'Navigational', 'Transactional')." },
        },
        required: ['keyword', 'volume', 'difficulty', 'intent'],
    }
};

const keywordClusterSchema = {
    type: Type.ARRAY,
    description: "A list of keyword clusters.",
    items: {
        type: Type.OBJECT,
        properties: {
            clusterName: { type: Type.STRING, description: "A short, descriptive name for the semantic keyword group (e.g., 'DIY Coffee Roasting')." },
            keywords: {
                type: Type.ARRAY,
                description: "An array of keyword objects belonging to this cluster.",
                items: {
                     type: Type.OBJECT,
                    properties: {
                        keyword: { type: Type.STRING },
                        volume: { type: Type.INTEGER },
                        difficulty: { type: Type.STRING },
                        intent: { type: Type.STRING },
                    },
                }
            }
        },
        required: ['clusterName', 'keywords'],
    }
};

const contentAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER, description: "A holistic score from 0-100 for the content's optimization for the target keyword." },
        readabilityGrade: { type: Type.INTEGER, description: "Readability score as a US school grade level (e.g., 8 for 8th grade)." },
        wordCount: { type: Type.INTEGER, description: "The total word count of the text." },
        keywordChecklist: {
            type: Type.OBJECT,
            properties: {
                inHeadline: { 
                    type: Type.OBJECT, 
                    properties: { met: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
                    description: "Check if the keyword is in a main headline (H1). The first line of text is likely the H1."
                },
                inSubheading: { 
                    type: Type.OBJECT, 
                    properties: { met: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
                    description: "Check if the keyword is in at least one subheading (H2, H3, etc.)."
                },
                inFirstParagraph: { 
                    type: Type.OBJECT, 
                    properties: { met: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
                    description: "Check if the keyword appears in the first ~100 words."
                },
                density: { 
                    type: Type.OBJECT, 
                    properties: { score: { type: Type.INTEGER }, feedback: { type: Type.STRING } },
                    description: "Score the keyword density from 0-100. Ideal is ~1-2%. Penalize for being too low or too high (keyword stuffing)."
                },
            },
        },
        semanticKeywords: {
            type: Type.ARRAY,
            description: "A list of 10 suggested LSI/semantic keywords relevant to the main keyword.",
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    included: { type: Type.BOOLEAN, description: "Is this semantic keyword already present in the text?" },
                },
            },
        },
        overallFeedback: { type: Type.STRING, description: "A single, highly actionable sentence suggesting the most important next step for improvement." },
    },
};

const contentBriefSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedTitle: { type: Type.STRING, description: "A compelling, SEO-friendly H1 title for an article on the topic." },
        suggestedMetaDescription: { type: Type.STRING, description: "An engaging meta description (155 characters max) that encourages clicks." },
        targetWordCount: { type: Type.INTEGER, description: "The recommended word count for the article based on competitor analysis." },
        targetReadabilityGrade: { type: Type.INTEGER, description: "The recommended readability level (e.g., 8 for 8th grade)." },
        outline: {
            type: Type.ARRAY,
            description: "A logical content outline with H2s and corresponding H3s.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The H2 heading title." },
                    subheadings: {
                        type: Type.ARRAY,
                        description: "An array of H3 subheadings for this section.",
                        items: { type: Type.STRING }
                    }
                }
            }
        },
        questionsToAnswer: {
            type: Type.ARRAY,
            description: "A list of key questions the article should answer, based on 'People Also Ask' data.",
            items: { type: Type.STRING }
        },
        semanticKeywords: {
            type: Type.ARRAY,
            description: "A list of essential LSI/semantic keywords to include for topical depth.",
            items: { type: Type.STRING }
        },
        toneOfVoice: { type: Type.STRING, description: "A brief analysis of the dominant tone of voice used by top competitors (e.g., 'Formal and academic', 'Casual and conversational')." },
        uniqueAngleSuggestion: { type: Type.STRING, description: "A creative suggestion for a unique angle or format to help this content stand out from the competition (e.g., 'Create an interactive calculator', 'Feature an interview with an industry expert')." }
    },
    required: ['suggestedTitle', 'suggestedMetaDescription', 'targetWordCount', 'targetReadabilityGrade', 'outline', 'questionsToAnswer', 'semanticKeywords', 'toneOfVoice', 'uniqueAngleSuggestion']
};

export const generateSchemaMarkup = async (pageContent: string, pageTypeHint: string): Promise<string> => {
    const prompt = `
        As an expert at creating Schema.org markup, analyze the following text content and generate the most appropriate and detailed JSON-LD schema.
        The user believes this page is about: "${pageTypeHint}". Use that as a strong hint.
        Possible schema types include, but are not limited to: Article, FAQPage, Product, LocalBusiness, Recipe, HowTo.
        Ensure the generated JSON-LD is valid and ready to be embedded in a <script> tag.
        Return ONLY the raw JSON string. Do not wrap it in markdown backticks or any other text.
        
        Page Content:
        ---
        ${pageContent}
        ---
    `;
    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 8192 },
            },
        });
        // The model is asked for raw JSON, but let's be safe and trim any whitespace or markdown.
        const text = response.text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
        // Validate and re-format to ensure it's clean JSON
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        console.error("Error generating schema markup:", error);
        throw new Error("Failed to generate Schema.org markup.");
    }
};

export const clusterKeywords = async (keywords: KeywordIdea[]): Promise<KeywordCluster[]> => {
    const prompt = `
        As an expert SEO strategist, group the following list of keywords into semantic clusters based on user intent and topic.
        Each cluster should have a concise, descriptive name.
        Return the result ONLY in the specified JSON format.

        Keywords to cluster:
        ---
        ${JSON.stringify(keywords)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: keywordClusterSchema,
                thinkingConfig: { thinkingBudget: 16384 },
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as KeywordCluster[];
    } catch (error) {
        console.error("Error clustering keywords:", error);
        throw new Error("Failed to cluster keywords with Gemini API.");
    }
};


export const parseUserCommand = async (commandText: string): Promise<Command> => {
    const prompt = `
        Parse the user's command into a structured JSON object based on the schema.
        - The 'action' should be one of 'audit', or 'keywords'.
        - 'audit' is for running a site audit or analysis.
        - 'keywords' is for finding or exploring keywords.
        - If the intent is unclear, use 'unknown'.
        - Extract any URL and keyword/topic as parameters. A URL must include a domain (e.g., example.com).
        
        Examples:
        - "audit example.com for 'best seo tool'" -> { "action": "audit", "parameters": { "url": "https://example.com", "keyword": "best seo tool" } }
        - "find keywords about content marketing" -> { "action": "keywords", "parameters": { "keyword": "content marketing" } }
        - "check backlinks for https://myblog.com" -> { "action": "unknown", "parameters": {} }
        - "what is seo" -> { "action": "unknown", "parameters": {} }
        
        User command: "${commandText}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: commandParserSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as Command;
    } catch (error) {
        console.error("Error calling Gemini API for command parsing:", error);
        throw new Error("Failed to parse command with Gemini API.");
    }
};

export const analyzeContentRealtime = async (content: string, keyword: string): Promise<ContentAnalysis> => {
    if (!keyword.trim()) throw new Error("A target keyword is required.");
    if (!content.trim()) throw new Error("Content is required for analysis.");

    const prompt = `
        As an expert SEO content optimization tool, analyze the following text for the target keyword: "${keyword}".
        The user is writing this content in a real-time editor. Provide an analysis based on the provided JSON schema.
        For the keyword checklist, infer headings from markdown-style syntax (e.g., '# Title' for H1, '## Subtitle' for H2) or from the first line of text if no markdown is present.
        For semantic keywords, suggest 10 relevant LSI keywords and indicate if they are already present in the text.
        Provide a readability grade based on a standard readability formula (like Flesch-Kincaid).
        All feedback must be concise and highly actionable. Return ONLY the JSON object.

        Text to analyze:
        ---
        ${content}
        ---
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: contentAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as ContentAnalysis;
    } catch (error) {
        console.error("Error calling Gemini API for content analysis:", error);
        throw new Error("Failed to get content analysis from Gemini API.");
    }
};

export const exploreKeywords = async (seedKeyword: string): Promise<KeywordIdea[]> => {
    if (!seedKeyword || seedKeyword.trim().length === 0) {
        throw new Error("A seed keyword is required.");
    }

    const prompt = `
        As an expert SEO keyword researcher, generate 20 related long-tail keywords, questions, and variations for the seed keyword: "${seedKeyword}".
        For each keyword, provide a realistic estimated monthly search volume, SEO difficulty (Low, Medium, or High), and the likely user intent (Informational, Commercial, Navigational, or Transactional).
        Return the results ONLY in the specified JSON format. Ensure volume is a number.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: keywordExplorerSchema,
                thinkingConfig: { thinkingBudget: 8192 },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as KeywordIdea[];
    } catch (error) {
        console.error("Error calling Gemini API for keyword exploration:", error);
        throw new Error("Failed to get keyword ideas from Gemini API.");
    }
};

export const generateContentBrief = async (topic: string): Promise<ContentBrief> => {
    if (!topic || topic.trim().length === 0) {
        throw new Error("A topic is required to generate a content brief.");
    }

    const prompt = `
        As an expert SEO Content Strategist, create a comprehensive content brief for an article on the topic: "${topic}".
        
        Perform a conceptual SERP analysis for this topic. Identify the common themes, user intent, structure, and tone of voice of top-ranking content.
        
        Based on this analysis, generate a detailed content brief using the provided JSON schema. The brief should provide a clear roadmap for a writer to create a piece of content that can outperform the competition.
        
        - The outline should be logical and comprehensive.
        - Questions to answer should be based on what users are likely searching for.
        - Semantic keywords should cover the topic in depth.
        - Word count and readability should be appropriate for the topic and likely audience.
        - The tone of voice analysis should be insightful.
        - The unique angle suggestion must be creative and actionable.

        Return ONLY the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: contentBriefSchema,
                thinkingConfig: { thinkingBudget: 16384 },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as ContentBrief;
    } catch (error) {
        console.error("Error calling Gemini API for content brief generation:", error);
        throw new Error("Failed to generate content brief from Gemini API.");
    }
};


export const analyzeSeo = async (params: { url: string, content: string, keyword: string, useGoogleSearch: boolean }): Promise<SeoAnalysis> => {
  const { url, content, keyword, useGoogleSearch } = params;

  let prompt;
  
  let latestTrendsContext = "";
  if (useGoogleSearch) {
      latestTrendsContext = await getLatestSeoTrends();
  }

  const contextInstruction = latestTrendsContext
    ? `In addition to your general knowledge, give special weight to the following summary of current SEO best practices, which has been retrieved from the live web. Use this to inform your scoring and feedback.
    ---
    LATEST SEO TRENDS:
    ${latestTrendsContext}
    ---
    `
    : "";

  const keywordInstruction = keyword && keyword.trim().length > 0
    ? `The user's primary SEO goal is to rank for: "${keyword}". Tailor your analysis and feedback to be highly relevant to this specific goal. Evaluate keyword usage, content relevance, and user intent related to this goal.`
    : `The user has not provided a specific keyword or goal. Perform a general SEO analysis.`;

  const jsonInstruction = `IMPORTANT: When generating feedback strings within the JSON response, you MUST escape any double quotes (\\") or other special characters to ensure the final output is a single, valid JSON object. For example, if the content has the text 'This is a "quote"', your feedback should be "feedback": "The content includes a quote: \\"quote\\".".`;

  const baseInstructions = `
    As a world-class, comprehensive SEO expert, analyze the SEO of the provided webpage based on ALL factors in the schema.
    This includes On-Page, Off-Page, Technical, Content, and Local SEO factors.
    For the imageSeo factor, you MUST identify all images missing alt text and, for each one, provide a descriptive, SEO-friendly 'suggested_alt' based on the image's src attribute and surrounding content.
    For the internalLinking factor, you must parse all internal anchor tags (e.g., <a href="/another-page">). For each one, analyze its anchor text for descriptiveness and relevance to the page's topic and provide specific feedback in the 'links' array. Do not analyze external links.
    ${contextInstruction}
    For factors you cannot directly measure (like backlinks or brand signals), perform a HYPOTHETICAL analysis based on SEO best practices for the given URL/topic and provide actionable advice.
    The URL for context is: ${url || 'Not provided'}.
    ${keywordInstruction}
    Provide scores from 0-100 for each category.
    Your feedback must be concise, actionable, and professional.
    ${jsonInstruction}
    Return the analysis ONLY in the specified JSON format.
  `;
  
  if (content && content.trim().length > 0) {
    prompt = `
      ${baseInstructions}
      Base your on-page analysis ENTIRELY on the HTML/text content provided below.

      CONTENT:
      ---
      ${content}
      ---
    `;
  } else {
    prompt = `
      ${baseInstructions}
      You cannot access the URL, so base your analysis on a hypothetical, but realistic and typical, representation of the content for a page at such a URL.
      For example, if the URL is 'nike.com/running-shoes', assume the page contains H1s like 'Men's Running Shoes', product descriptions, images of shoes, etc. If the goal is "lightweight running shoes", your analysis should focus on that aspect.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: seoAnalysisSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as SeoAnalysis;

  } catch (error)
 {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get SEO analysis from Gemini API.");
  }
};