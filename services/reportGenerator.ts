import type { SeoAnalysis, SeoFactor } from '../types';

const formatFactor = (name: string, factor: SeoFactor | (SeoFactor & object) | undefined): string => {
    if (!factor || typeof factor.score !== 'number') {
        return `  - ${name}: Data not available.`;
    }
    
    if (name.includes('Page Speed') && 'core_web_vitals' in factor) {
        const ps = factor as SeoAnalysis['pageSpeed'];
        let details = `  - ${name}:\n`;
        details += `    - Overall Score: ${ps.score}/100, Status: ${ps.status}\n`;
        details += `    - Overall Feedback: ${ps.feedback}\n`;
        details += `    - --- Core Web Vitals ---\n`;
        details += `    - LCP (${ps.core_web_vitals.lcp.value}): Score ${ps.core_web_vitals.lcp.score}, ${ps.core_web_vitals.lcp.feedback}\n`;
        details += `    - INP (${ps.core_web_vitals.inp.value}): Score ${ps.core_web_vitals.inp.score}, ${ps.core_web_vitals.inp.feedback}\n`;
        details += `    - CLS (${ps.core_web_vitals.cls.value}): Score ${ps.core_web_vitals.cls.score}, ${ps.core_web_vitals.cls.feedback}\n`;
        details += `    - --- Other Key Metrics ---\n`;
        details += `    - FCP (${ps.other_metrics.fcp.value}): Score ${ps.other_metrics.fcp.score}, ${ps.other_metrics.fcp.feedback}\n`;
        details += `    - TTFB (${ps.other_metrics.ttfb.value}): Score ${ps.other_metrics.ttfb.score}, ${ps.other_metrics.ttfb.feedback}`;
        return details;
    }
    
    let details = `Score: ${factor.score}/100, Status: ${factor.status}`;
    if ('top_keywords' in factor && Array.isArray(factor.top_keywords)) {
        details += `, Top Keywords: [${factor.top_keywords.join(', ')}]`;
    }
     if ('h1_count' in factor) {
        details += `, H1s: ${factor.h1_count}`;
    }
    if ('h2_count' in factor) {
        details += `, H2s: ${factor.h2_count}`;
    }
    if ('h3_count' in factor) {
        details += `, H3s: ${factor.h3_count}`;
    }
    if ('average_paragraph_length' in factor) {
        details += `, Avg Paragraph Length: ${factor.average_paragraph_length} words`;
    }
    if ('long_paragraphs_count' in factor) {
        details += `, Long Paragraphs (>150 words): ${factor.long_paragraphs_count}`;
    }
    if ('images_missing_alt' in factor) {
        details += `, Images Missing Alt: ${factor.images_missing_alt}`;
    }
    if (name.includes('Meta Tag') && 'suggested_keywords' in factor && Array.isArray(factor.suggested_keywords) && factor.suggested_keywords.length > 0) {
        details += `, Suggested Keywords: [${factor.suggested_keywords.join(', ')}]`;
    }


    return `  - ${name}:\n    - ${details}\n    - Feedback: ${factor.feedback}`;
};

export const generateLlmPrompt = (analysis: SeoAnalysis, url: string, keyword: string): string => {
    
    const keywordContext = keyword 
        ? `The primary goal for this page is to rank for the keyword: "${keyword}".`
        : "No specific keyword was provided, so this is a general SEO audit.";

    const prompt = `
ROLE: You are a world-class SEO expert and digital marketing consultant.

TASK: Your client has provided you with a detailed, data-driven SEO analysis report for their webpage. Your job is to transform this raw data into a prioritized, step-by-step action plan. For each point of feedback, provide a clear explanation of *why* it's important for SEO and a practical, detailed example of *how* to implement the fix. Your tone should be encouraging, professional, and highly actionable.

CONTEXT:
- Webpage URL: ${url}
- SEO Goal: ${keywordContext}

---
ANALYSIS DATA:
---

Here is the raw SEO analysis data. Use this data as the single source of truth for your action plan.

Overall Summary:
- Score: ${analysis.overall.score}/100 (${analysis.overall.status})
- Key Findings: ${analysis.overall.summary}

Detailed Factor Breakdown:

1. Content & Authority:
${formatFactor('Title Tag', analysis.title)}
${formatFactor('Meta Description', analysis.metaDescription)}
${formatFactor('Headings & Content Structure', analysis.headings)}
${formatFactor('Content Keywords', analysis.contentKeywords)}
${formatFactor('Image SEO', analysis.imageSeo)}
${formatFactor('E-E-A-T (Experience, Expertise, Authoritativeness, Trust)', analysis.e_e_a_t)}
${formatFactor('LLM Readiness (for AI Overviews)', analysis.llmReadiness)}
${formatFactor('User Intent Match', analysis.userIntentMatch)}
${formatFactor('Content Freshness', analysis.contentFreshness)}
${formatFactor('Internal Linking', analysis.internalLinking)}

2. Technical SEO:
${formatFactor('Page Speed (Core Web Vitals)', analysis.pageSpeed)}
${formatFactor('Mobile Friendliness', analysis.mobileFriendly)}
${formatFactor('Security (HTTPS)', analysis.security)}
${formatFactor('Structured Data (Schema)', analysis.structuredData)}
${formatFactor('URL Structure', analysis.urlStructure)}
${formatFactor('On-Page Link Health', analysis.linkHealth)}
${formatFactor('Indexability', analysis.indexability)}
${formatFactor('XML Sitemap', analysis.xmlSitemap)}
${formatFactor('Meta Tag Optimization', analysis.metaTagOptimization)}

3. User Experience:
${formatFactor('Accessibility', analysis.accessibility)}
${formatFactor('Readability', analysis.readability)}
${formatFactor('Call to Action (CTA) Effectiveness', analysis.ctaEffectiveness)}

4. Hypothetical Off-Page & Local SEO:
${formatFactor('Backlink Profile', analysis.backlinkProfile)}
${formatFactor('Brand Signals', analysis.brandSignals)}
${formatFactor('Google Business Profile', analysis.googleBusinessProfile)}
${formatFactor('NAP Consistency', analysis.napConsistency)}
${formatFactor('Local Reviews', analysis.localReviews)}

---
YOUR DELIVERABLE:
---

Based *only* on the data above, produce the following output in well-structured Markdown:

1.  **Executive Summary:** A brief, high-level overview of the page's current SEO health and the top 2-3 priorities.
2.  **Prioritized Action Plan:** Create a checklist of tasks, ordered from most critical to least critical. For each task:
    *   **Task:** A clear, concise action item (e.g., "Revise the Title Tag").
    *   **Why It Matters:** Explain the SEO impact of this task in simple terms.
    *   **How to Fix It:** Provide concrete, step-by-step instructions and examples based on the feedback from the report.
3.  **Conclusion:** A brief, encouraging closing statement.
`;

    return prompt.trim();
};