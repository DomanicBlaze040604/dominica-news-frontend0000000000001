import { Article } from '../types/api';
import { SEO_CONFIG } from './seoConfig';

export interface NewsArticleSchema {
  "@context": string;
  "@type": string;
  headline: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  author: {
    "@type": string;
    name: string;
    url?: string;
  };
  publisher: {
    "@type": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  description?: string;
  url: string;
  mainEntityOfPage: {
    "@type": string;
    "@id": string;
  };
  articleSection?: string;
  keywords?: string[];
}

/**
 * Generate JSON-LD structured data for a news article
 */
export const generateNewsArticleSchema = (article: Article, baseUrl: string = window.location.origin): NewsArticleSchema => {
  const articleUrl = `${baseUrl}/articles/${article.slug}`;
  
  // Extract keywords from SEO description and title, plus category
  const keywords = [
    'Dominica News',
    'Breaking News',
    article.category.name,
  ];
  
  // Add specific keywords based on category
  const categoryKeywords: Record<string, string[]> = {
    'politics': ['Politics', 'Government', 'Elections'],
    'weather': ['Weather Updates', 'Climate', 'Hurricane'],
    'sports': ['Sports News', 'Athletics', 'Competition'],
    'entertainment': ['Entertainment', 'Culture', 'Events'],
    'business': ['Business', 'Economy', 'Finance'],
    'world': ['World News', 'International'],
    'crime': ['Crime', 'Safety', 'Law Enforcement'],
    'caribbean': ['Caribbean', 'Regional News'],
    'trending': ['Trending', 'Popular', 'Viral']
  };
  
  const categorySlug = article.category.slug?.toLowerCase() || article.category.name.toLowerCase();
  if (categoryKeywords[categorySlug]) {
    keywords.push(...categoryKeywords[categorySlug]);
  }
  
  // Add keywords from SEO fields if available
  if (article.seoDescription) {
    const seoWords = article.seoDescription
      .split(/[,\s]+/)
      .filter(word => word.length > 3)
      .slice(0, 3); // Take first 3 meaningful words
    keywords.push(...seoWords);
  }

  const schema: NewsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.seoTitle || article.title,
    image: article.featuredImage ? [article.featuredImage] : [],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: SEO_CONFIG.news.organization,
    description: article.seoDescription || article.excerpt || article.title,
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    articleSection: article.category.name,
    keywords: [...new Set(keywords)] // Remove duplicates
  };

  return schema;
};

/**
 * Generate meta tags for SEO following news industry best practices
 */
export const generateMetaTags = (article: Article, baseUrl: string = window.location.origin) => {
  const articleUrl = `${baseUrl}/articles/${article.slug}`;
  
  // Create SEO-optimized title following news site patterns
  const seoTitle = article.seoTitle || article.title;
  const optimizedTitle = SEO_CONFIG.templates.article.title(seoTitle, article.category.name);
  
  // Create SEO-optimized description following competitor patterns
  const baseDescription = article.seoDescription || article.excerpt || article.title;
  const optimizedDescription = baseDescription.length > 155 
    ? `${baseDescription.substring(0, 152)}...` 
    : baseDescription;
  
  // Add location and category context for better SEO
  const locationContext = 'Dominica';
  const categoryContext = article.category.name.toLowerCase();
  const contextualDescription = `${optimizedDescription} | ${locationContext} ${categoryContext} news coverage by Dominica News`;
  
  const finalDescription = contextualDescription.length > 160 
    ? optimizedDescription 
    : contextualDescription;

  const image = article.featuredImage || `${baseUrl}/default-og-image.jpg`;

  return {
    title: optimizedTitle,
    description: finalDescription,
    canonical: articleUrl,
    keywords: [
      'Dominica News',
      'Breaking News',
      article.category.name,
      locationContext,
      ...extractKeywordsFromContent(article.title, article.excerpt)
    ].join(', '),
    openGraph: {
      title: seoTitle,
      description: finalDescription,
      url: articleUrl,
      type: 'article',
      image,
      siteName: 'Dominica News',
      locale: 'en_US',
      article: {
        publishedTime: article.publishedAt || article.createdAt,
        modifiedTime: article.updatedAt || article.publishedAt || article.createdAt,
        author: article.author.name,
        section: article.category.name,
        tag: [
          'Dominica News',
          'Breaking News',
          article.category.name,
          locationContext,
          categoryContext
        ]
      }
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: finalDescription,
      image,
      site: '@DominicaNews',
      creator: `@${article.author.name.replace(/\s+/g, '')}`,
      label1: 'Category',
      data1: article.category.name,
      label2: 'Reading time',
      data2: `${estimateReadingTime(article.content)} min read`
    }
  };
};

/**
 * Extract relevant keywords from article content
 */
const extractKeywordsFromContent = (title: string, excerpt?: string): string[] => {
  const text = `${title} ${excerpt || ''}`.toLowerCase();
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an'];
  
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 5);
    
  return words;
};

/**
 * Estimate reading time for article
 */
const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Inject JSON-LD script into document head
 */
export const injectJsonLd = (schema: NewsArticleSchema) => {
  // Remove existing JSON-LD script if present
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new JSON-LD script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
};

/**
 * Update document meta tags
 */
export const updateMetaTags = (metaTags: ReturnType<typeof generateMetaTags>) => {
  // Update title
  document.title = metaTags.title;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property?: boolean) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Basic meta tags
  updateMetaTag('description', metaTags.description);
  updateMetaTag('keywords', metaTags.openGraph.article?.tag?.join(', ') || '');

  // Open Graph tags
  updateMetaTag('og:title', metaTags.openGraph.title, true);
  updateMetaTag('og:description', metaTags.openGraph.description, true);
  updateMetaTag('og:url', metaTags.openGraph.url, true);
  updateMetaTag('og:type', metaTags.openGraph.type, true);
  updateMetaTag('og:image', metaTags.openGraph.image, true);
  updateMetaTag('og:site_name', metaTags.openGraph.siteName, true);
  
  if (metaTags.openGraph.article) {
    updateMetaTag('article:published_time', metaTags.openGraph.article.publishedTime, true);
    updateMetaTag('article:modified_time', metaTags.openGraph.article.modifiedTime, true);
    updateMetaTag('article:author', metaTags.openGraph.article.author, true);
    updateMetaTag('article:section', metaTags.openGraph.article.section, true);
  }

  // Twitter tags
  updateMetaTag('twitter:card', metaTags.twitter.card);
  updateMetaTag('twitter:title', metaTags.twitter.title);
  updateMetaTag('twitter:description', metaTags.twitter.description);
  updateMetaTag('twitter:image', metaTags.twitter.image);
  updateMetaTag('twitter:site', metaTags.twitter.site);
  updateMetaTag('twitter:creator', metaTags.twitter.creator);

  // Canonical link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', metaTags.canonical);
};