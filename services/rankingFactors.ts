import type { SeoAnalysis } from '../types';

export type FactorCategory = 'Content & Authority' | 'Technical SEO' | 'User Experience' | 'Off-Page & Local';

export interface RankingFactor {
  id: keyof SeoAnalysis;
  title: string;
  category: FactorCategory;
  importance: number; // 1-10, 10 is highest
  description: string;
  criteria: string[];
}

export const rankingFactors: RankingFactor[] = [
  // Content & Authority
  {
    id: 'overall',
    title: 'Overall Score',
    category: 'Content & Authority',
    importance: 10,
    description: 'A holistic score representing the overall SEO health of the page, calculated from all other factors.',
    criteria: ['Weighted average of all other scores.', 'Considers the most critical SEO elements.'],
  },
  {
    id: 'userIntentMatch',
    title: 'User Intent Match',
    category: 'Content & Authority',
    importance: 10,
    description: 'Evaluates how well the content addresses the likely reason a user is searching for the target keyword (e.g., to learn, to buy, to find a specific site).',
    criteria: ['Alignment with informational, commercial, navigational, or transactional intent.', 'Content format (e.g., blog post, product page) matches keyword type.', 'Depth and detail are appropriate for the user\'s needs.'],
  },
  {
    id: 'e_e_a_t',
    title: 'E-E-A-T',
    category: 'Content & Authority',
    importance: 9,
    description: 'Assesses signals of Experience, Expertise, Authoritativeness, and Trustworthiness, which are crucial for Google\'s quality evaluation.',
    criteria: ['Presence of author biographies and credentials.', 'Citations of reputable sources.', 'Clear contact information and company details.', 'Positive user reviews or testimonials mentioned.'],
  },
  {
    id: 'title',
    title: 'Title Tag',
    category: 'Content & Authority',
    importance: 9,
    description: 'The HTML title tag is a primary signal to search engines about the page\'s topic and is often shown as the headline in search results.',
    criteria: ['Optimal length (50-60 characters).', 'Primary keyword is included, preferably near the beginning.', 'Title is compelling and accurately reflects page content.'],
  },
  {
    id: 'contentKeywords',
    title: 'Content Keywords',
    category: 'Content & Authority',
    importance: 8,
    description: 'Analyzes the use of the primary keyword and related semantic terms within the main body content of the page.',
    criteria: ['Primary keyword is present but not overused ("keyword stuffing").', 'Use of LSI (Latent Semantic Indexing) keywords and synonyms.', 'Keywords are naturally integrated into the text.'],
  },
  {
    id: 'headings',
    title: 'Headings',
    category: 'Content & Authority',
    importance: 8,
    description: 'Proper use of heading tags (H1, H2, etc.) helps structure content for both users and search engines, and provides semantic clues about the content hierarchy.',
    criteria: ['A single, well-crafted H1 tag is present.', 'Logical and hierarchical use of H2, H3, etc.', 'Headings include relevant keywords where appropriate.'],
  },
  {
    id: 'metaDescription',
    title: 'Meta Description',
    category: 'Content & Authority',
    importance: 7,
    description: 'The meta description is a summary of the page\'s content shown in search results. While not a direct ranking factor, it heavily influences click-through rate (CTR).',
    criteria: ['Optimal length (150-160 characters).', 'Includes the primary keyword and a compelling call-to-action.', 'Accurately summarizes the page content.'],
  },
   {
    id: 'contentFreshness',
    title: 'Content Freshness',
    category: 'Content & Authority',
    importance: 7,
    description: 'Evaluates if the content is up-to-date, especially for topics where recency is important (e.g., news, reviews of new products).',
    criteria: ['Content publication or update dates.', 'Relevance of information for the current time.', 'Topic\'s general need for fresh information.'],
  },
  {
    id: 'internalLinking',
    title: 'Internal Linking',
    category: 'Content & Authority',
    importance: 7,
    description: 'Performs a detailed analysis of all internal links on the page. It checks for descriptive, relevant anchor text and evaluates how links contribute to the site\'s architecture and topical authority.',
    criteria: ['Evaluates anchor text quality for each link.', 'Assesses relevance of linked-to pages.', 'Identifies opportunities to strengthen topical clusters.', 'Provides a link-by-link breakdown of issues.'],
  },
  {
    id: 'llmReadiness',
    title: 'LLM Readiness',
    category: 'Content & Authority',
    importance: 6,
    description: 'Assesses the content\'s structure and clarity for consumption by Large Language Models, such as those powering Google\'s AI Overviews.',
    criteria: ['Clear, concise language.', 'Well-structured content with headings and lists.', 'Direct answers to potential questions.'],
  },

  // Technical SEO
  {
    id: 'indexability',
    title: 'Indexability',
    category: 'Technical SEO',
    importance: 10,
    description: 'Determines if search engines can easily crawl and add the page to their index. If a page isn\'t indexed, it can\'t rank.',
    criteria: ['No "noindex" meta tag present.', 'Canonical tag is correctly implemented (self-referencing or pointing to the primary version).', 'Not blocked by the robots.txt file.'],
  },
  {
    id: 'mobileFriendly',
    title: 'Mobile-Friendly',
    category: 'Technical SEO',
    importance: 9,
    description: 'With mobile-first indexing, Google primarily uses the mobile version of a page for ranking. A poor mobile experience can severely impact rankings.',
    criteria: ['Uses responsive design principles.', 'Text is readable without zooming.', 'Tap targets (like buttons and links) are appropriately spaced.'],
  },
  {
    id: 'pageSpeed',
    title: 'Page Speed (Core Web Vitals)',
    category: 'Technical SEO',
    importance: 9,
    description: 'Page loading speed and responsiveness are confirmed ranking factors, measured by Core Web Vitals (CWV). Slow pages lead to poor user experience and lower rankings.',
    criteria: [
        'Largest Contentful Paint (LCP) measures loading performance.', 
        'Interaction to Next Paint (INP) measures interactivity.', 
        'Cumulative Layout Shift (CLS) measures visual stability.'
    ],
  },
  {
    id: 'security',
    title: 'Security',
    category: 'Technical SEO',
    importance: 8,
    description: 'Ensures the website is served over a secure (HTTPS) connection, which protects users\' data and is a confirmed ranking signal.',
    criteria: ['URL uses HTTPS.', 'No mixed content (HTTP resources on an HTTPS page).', 'Presence of security/privacy policy links.'],
  },
  {
    id: 'urlStructure',
    title: 'URL Structure',
    category: 'Technical SEO',
    importance: 6,
    description: 'A clean, descriptive URL provides users and search engines with a clear idea of the page\'s content.',
    criteria: ['URL is readable and easy to understand.', 'Includes relevant keywords.', 'Is reasonably short and avoids excessive parameters.'],
  },
  {
    id: 'structuredData',
    title: 'Structured Data',
    category: 'Technical SEO',
    importance: 6,
    description: 'Schema markup helps search engines understand the content and context of a page, which can lead to rich results (e.g., review stars, FAQs) in search.',
    criteria: ['Presence and validity of Schema.org JSON-LD markup.', 'Markup is relevant to the page content (e.g., Article, Product, Recipe).'],
  },
   {
    id: 'xmlSitemap',
    title: 'XML Sitemap',
    category: 'Technical SEO',
    importance: 5,
    description: 'While not directly on the page, a well-formed XML sitemap helps search engines discover and crawl all important pages on a site.',
    criteria: ['Hypothetical check for best practices.', 'Importance of including the page in a clean, up-to-date sitemap.', 'Sitemap should be submitted to Google Search Console.'],
  },
  {
    id: 'metaTagOptimization',
    title: 'Meta Tag Optimization',
    category: 'Technical SEO',
    importance: 2,
    description: 'Analyzes the meta keywords tag. While largely ignored by major search engines for ranking, it can be used by some internal site search systems. This check ensures it is used effectively or not at all, preventing potential issues with keyword stuffing.',
    criteria: ['Checks for presence and relevance.', 'Flags keyword stuffing (excessive or irrelevant keywords).', 'Provides AI-generated suggestions for a concise, relevant keyword list.'],
  },
 
  // User Experience
  {
    id: 'readability',
    title: 'Readability',
    category: 'User Experience',
    importance: 7,
    description: 'Measures how easy it is for a user to read and understand the content. High readability leads to lower bounce rates and better engagement.',
    criteria: ['Short sentences and paragraphs.', 'Use of simple language.', 'Good formatting with whitespace, lists, and bolding.'],
  },
  {
    id: 'imageSeo',
    title: 'Image SEO',
    category: 'User Experience',
    importance: 6,
    description: 'Optimizing images can drive traffic from image search and improve accessibility. Alt text is a key component. This analysis provides AI-generated suggestions for missing alt text.',
    criteria: ['Identifies images missing descriptive alt text.', 'Provides AI-generated alt text suggestions.', 'Checks for descriptive file names.'],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    category: 'User Experience',
    importance: 6,
    description: 'Ensures that the page is usable by people with disabilities, including those who use screen readers. This often overlaps with general SEO best practices.',
    criteria: ['Use of semantic HTML (e.g., <nav>, <main>).', 'Sufficient color contrast.', 'Descriptive text for links.'],
  },
  {
    id: 'ctaEffectiveness',
    title: 'CTA Effectiveness',
    category: 'User Experience',
    importance: 5,
    description: 'Analyzes the presence and clarity of Calls to Action (CTAs), which guide the user to the desired next step.',
    criteria: ['CTAs are present and clearly visible.', 'Action-oriented language is used (e.g., "Buy Now", "Learn More").', 'CTAs stand out from the rest of the page content.'],
  },
  {
    id: 'linkHealth',
    title: 'On-Page Link Health',
    category: 'User Experience',
    importance: 5,
    description: 'Checks the links on the page to ensure they are functional and provide a good user experience.',
    criteria: ['No broken (404) internal or external links.', 'Anchor text is descriptive and not generic (e.g., avoid "click here").'],
  },

  // Off-Page & Local
  {
    id: 'backlinkProfile',
    title: 'Backlink Profile',
    category: 'Off-Page & Local',
    importance: 9,
    description: 'A hypothetical analysis of the quantity and quality of links from other websites. Backlinks are one of the most powerful ranking factors.',
    criteria: ['Importance of links from high-authority, relevant websites.', 'Natural and diverse anchor text.', 'A steady rate of new link acquisition.'],
  },
  {
    id: 'brandSignals',
    title: 'Brand Signals',
    category: 'Off-Page & Local',
    importance: 8,
    description: 'A hypothetical look at how the brand is mentioned across the web. Strong brand signals indicate authority and trust to search engines.',
    criteria: ['Volume of branded searches.', 'Unlinked mentions of the brand name.', 'Social media presence and engagement.'],
  },
  {
    id: 'googleBusinessProfile',
    title: 'Google Business Profile',
    category: 'Off-Page & Local',
    importance: 7,
    description: 'For local businesses, a well-optimized Google Business Profile is critical for appearing in the local map pack and knowledge panel.',
    criteria: ['Completeness of the profile (hours, services, etc.).', 'Use of Google Posts.', 'Responsiveness to Q&A and reviews.'],
  },
  {
    id: 'localReviews',
    title: 'Local Reviews',
    category: 'Off-Page & Local',
    importance: 7,
    description: 'Hypothetical analysis of the quantity, quality, and recency of reviews on platforms like Google, Yelp, etc. for local businesses.',
    criteria: ['High average star rating.', 'Consistent flow of new reviews.', 'Business owner responds to reviews.'],
  },
  {
    id: 'napConsistency',
    title: 'NAP Consistency',
    category: 'Off-Page & Local',
    importance: 6,
    description: 'For local SEO, ensuring the business Name, Address, and Phone number are consistent across all online directories and citations is crucial for building trust.',
    criteria: ['Uniformity of NAP data across major citation sites.', 'Presence in key local directories.'],
  },
];