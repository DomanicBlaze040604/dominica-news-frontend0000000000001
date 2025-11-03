import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { breakingNewsService } from '../services/breakingNews';
import { BreakingNews } from '../types/api';

interface BreakingNewsTickerProps {
  className?: string;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ className = '' }) => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBreakingNews();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchBreakingNews, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBreakingNews = async () => {
    try {
      const news = await breakingNewsService.getActive();
      setBreakingNews(news);
      
      // Reset dismissed state if there's new breaking news
      if (news && (!breakingNews || news.id !== breakingNews.id)) {
        setIsDismissed(false);
      }
    } catch (error) {
      console.error('Failed to fetch breaking news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't render if loading, no breaking news, or dismissed
  if (isLoading || !breakingNews || isDismissed) {
    return null;
  }

  return (
    <div className={`breaking-news-ticker ${className}`}>
      <div className="breaking-news-container">
        <div className="breaking-news-label">
          <span className="breaking-text">BREAKING</span>
        </div>
        <div className="breaking-news-content">
          <div className="breaking-news-text">
            {breakingNews.text}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="breaking-news-dismiss"
          aria-label="Dismiss breaking news"
        >
          <X size={18} />
        </button>
      </div>
      

    </div>
  );
};