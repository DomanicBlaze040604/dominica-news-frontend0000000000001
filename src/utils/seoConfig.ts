/**
 * SEO Configuration following news industry best practices
 * Aligned with competitor analysis and Google News guidelines
 */

export const SEO_CONFIG = {
  // Site-wide SEO settings
  site: {
    name: 'Dominica News',
    description: 'Your trusted source for breaking news, politics, weather, sports, and entertainment from Dominica and the Caribbean region.',
    url: 'https://dominicanews.com',
    logo: '/logo.png',
    defaultImage: '/default-og-image.jpg',
    language: 'en',
    locale: 'en_US',
    twitterHandle: '@DominicaNews',
    facebookPage: 'https://facebook.com/DominicaNews',
  },

  // News-specific SEO patterns
  news: {
    publisher: {
      name: 'Dominica News',
      logo: '/logo.png',
      url: 'https://dominicanews.com'
    },
    organization: {
      '@type': 'NewsMediaOrganization',
      name: 'Dominica News',
      url: 'https://dominicanews.com',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png'
      },
      sameAs: [
        'https://facebook.com/DominicaNews',
        'https://twitter.com/DominicaNews',
        'https://instagram.com/DominicaNews'
      ]
    }
  },

  // Category-specific SEO patterns (following competitor analysis)
  categories: {
    politics: {
      keywords: ['Dominica Politics', 'Government News', 'Elections', 'Political Analysis'],
      description: 'Latest political news and government updates from Dominica',
    },
    weather: {
      keywords: ['Dominica Weather', 'Hurricane Updates', 'Climate News', 'Weather Forecast'],
      description: 'Current weather conditions, forecasts, and climate news for Dominica',
    },
    sports: {
      keywords: ['Dominica Sports', 'Athletics', 'Cricket', 'Football', 'Sports News'],
      description: 'Sports news, scores, and athletic achievements from Dominica',
    },
    entertainment: {
      keywords: ['Dominica Entertainment', 'Culture', 'Events', 'Arts', 'Music'],
      description: 'Entertainment news, cultural events, and arts coverage from Dominica',
    },
    business: {
      keywords: ['Dominica Business', 'Economy', 'Finance', 'Trade', 'Investment'],
      description: 'Business news, economic updates, and financial coverage from Dominica',
    },
    world: {
      keywords: ['World News', 'International', 'Global Affairs', 'Foreign News'],
      description: 'International news and global affairs coverage',
    },
    crime: {
      keywords: ['Dominica Crime', 'Safety', 'Law Enforcement', 'Justice', 'Security'],
      description: 'Crime reports, safety updates, and law enforcement news from Dominica',
    },
    caribbean: {
      keywords: ['Caribbean News', 'Regional', 'CARICOM', 'West Indies'],
      description: 'Regional Caribbean news and developments affecting the region',
    },
    trending: {
      keywords: ['Trending News', 'Popular', 'Viral', 'Social Media', 'Current Events'],
      description: 'Trending stories and popular news from Dominica and beyond',
    }
  },

  // Meta tag templates following news industry patterns
  templates: {
    article: {
      title: (title: string, category: string) => 
        `${title} - ${category} News | Dominica News`,
      description: (excerpt: string, category: string) => 
        `${excerpt} | Latest ${category.toLowerCase()} news from Dominica News - your trusted source for breaking news.`,
      keywords: (category: string, customKeywords: string[] = []) => [
        'Dominica News',
        'Breaking News',
        category,
        'Caribbean News',
        'Latest News',
        ...customKeywords
      ]
    },
    category: {
      title: (category: string) => 
        `${category} News - Latest Updates | Dominica News`,
      description: (category: string) => 
        `Stay updated with the latest ${category.toLowerCase()} news from Dominica. Breaking stories, analysis, and comprehensive coverage.`
    },
    homepage: {
      title: 'Dominica News - Breaking News, Politics, Weather & Sports',
      description: 'Your trusted source for breaking news from Dominica. Get the latest updates on politics, weather, sports, entertainment, and Caribbean regional news.',
      keywords: [
        'Dominica News',
        'Breaking News',
        'Caribbean News',
        'Politics',
        'Weather Updates',
        'Sports News',
        'Entertainment',
        'Business News'
      ]
    }
  },

  // Structured data templates
  structuredData: {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Dominica News',
      url: 'https://dominicanews.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://dominicanews.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    breadcrumb: (items: Array<{name: string, url: string}>) => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    })
  },

  // URL structure patterns (following competitor analysis)
  urls: {
    article: (slug: string) => `/articles/${slug}`,
    category: (slug: string) => `/category/${slug}`,
    author: (slug: string) => `/author/${slug}`,
    tag: (slug: string) => `/tag/${slug}`,
    search: (query: string) => `/search?q=${encodeURIComponent(query)}`
  },

  // Social media optimization
  social: {
    twitter: {
      site: '@DominicaNews',
      cardType: 'summary_large_image'
    },
    facebook: {
      appId: process.env.REACT_APP_FACEBOOK_APP_ID || '',
      pages: ['DominicaNews']
    },
    openGraph: {
      type: 'website',
      siteName: 'Dominica News',
      locale: 'en_US'
    }
  }
};

/**
 * Generate category-specific SEO data
 */
export const getCategorySEO = (categorySlug: string, categoryName: string) => {
  const categoryConfig = SEO_CONFIG.categories[categorySlug as keyof typeof SEO_CONFIG.categories];
  
  return {
    title: SEO_CONFIG.templates.category.title(categoryName),
    description: categoryConfig?.description || SEO_CONFIG.templates.category.description(categoryName),
    keywords: categoryConfig?.keywords || [categoryName, 'Dominica News', 'Breaking News'],
    canonical: SEO_CONFIG.urls.category(categorySlug)
  };
};

/**
 * Generate homepage SEO data
 */
export const getHomepageSEO = () => ({
  title: SEO_CONFIG.templates.homepage.title,
  description: SEO_CONFIG.templates.homepage.description,
  keywords: SEO_CONFIG.templates.homepage.keywords.join(', '),
  canonical: SEO_CONFIG.site.url
});