import React, { useEffect } from 'react';
import { Article } from '../types/api';
import { generateNewsArticleSchema, generateMetaTags, injectJsonLd, updateMetaTags } from '../utils/seoHelpers';

interface SEOHeadProps {
  article: Article;
  baseUrl?: string;
}

/**
 * SEO Head component that injects structured data and meta tags for articles
 */
export const SEOHead: React.FC<SEOHeadProps> = ({ 
  article, 
  baseUrl = window.location.origin 
}) => {
  useEffect(() => {
    // Generate structured data and meta tags
    const schema = generateNewsArticleSchema(article, baseUrl);
    const metaTags = generateMetaTags(article, baseUrl);

    // Inject JSON-LD structured data
    injectJsonLd(schema);

    // Update meta tags
    updateMetaTags(metaTags);

    // Cleanup function to remove JSON-LD when component unmounts
    return () => {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [article, baseUrl]);

  // This component doesn't render anything visible
  return null;
};

export default SEOHead;