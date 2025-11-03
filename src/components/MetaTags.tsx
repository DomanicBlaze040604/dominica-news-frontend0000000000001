import React, { useEffect } from 'react';
import { SEO_CONFIG, getCategorySEO, getHomepageSEO } from '../utils/seoConfig';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  category?: string;
  categorySlug?: string;
}

/**
 * Meta Tags component for SEO optimization
 * Handles homepage, category pages, and general page SEO
 */
export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  category,
  categorySlug
}) => {
  useEffect(() => {
    // Determine SEO data based on page type
    let seoData;
    
    if (categorySlug && category) {
      seoData = getCategorySEO(categorySlug, category);
    } else if (!title && !description) {
      seoData = getHomepageSEO();
    } else {
      const canonicalUrl = canonical || window.location.href;
      seoData = {
        title: title || SEO_CONFIG.site.name,
        description: description || SEO_CONFIG.site.description,
        keywords: keywords || '',
        canonical: canonicalUrl
      };
    }

    // Update document title
    document.title = seoData.title;

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
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', typeof seoData.keywords === 'string' ? seoData.keywords : seoData.keywords.join(', '));
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    
    // Language and locale
    updateMetaTag('language', SEO_CONFIG.site.language);
    
    // Open Graph tags
    const ogImage = image || SEO_CONFIG.site.defaultImage;
    const ogUrl = seoData.canonical || window.location.href;
    
    updateMetaTag('og:title', seoData.title, true);
    updateMetaTag('og:description', seoData.description, true);
    updateMetaTag('og:url', ogUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', SEO_CONFIG.site.name, true);
    updateMetaTag('og:locale', SEO_CONFIG.site.locale, true);
    
    // Twitter tags
    updateMetaTag('twitter:card', SEO_CONFIG.social.twitter.cardType);
    updateMetaTag('twitter:site', SEO_CONFIG.social.twitter.site);
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);
    updateMetaTag('twitter:image', ogImage);
    
    // News-specific meta tags
    if (type === 'article' || categorySlug) {
      updateMetaTag('news_keywords', typeof seoData.keywords === 'string' ? seoData.keywords : seoData.keywords.slice(0, 10).join(', '));
      updateMetaTag('article:publisher', SEO_CONFIG.site.facebookPage, true);
    }
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', seoData.canonical || ogUrl);

    // Add structured data for website
    if (!categorySlug && !title) {
      // Homepage - add website structured data
      const existingScript = document.querySelector('script[type="application/ld+json"][data-type="website"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-type', 'website');
      script.textContent = JSON.stringify(SEO_CONFIG.structuredData.website, null, 2);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, canonical, image, type, category, categorySlug]);

  // This component doesn't render anything visible
  return null;
};

export default MetaTags;