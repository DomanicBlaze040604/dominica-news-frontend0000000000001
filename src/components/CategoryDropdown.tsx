import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "../services/categories";
import { LazyImage } from "./LazyImage";
import { cn } from "@/lib/utils";

interface CategoryDropdownProps {
  categorySlug: string;
  categoryName: string;
  isActive: boolean;
}

export const CategoryDropdown = ({ categorySlug, categoryName, isActive }: CategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch category preview data when hovering
  const { data: previewData, isLoading } = useQuery({
    queryKey: ['category-preview', categorySlug],
    queryFn: () => categoriesService.getCategoryPreview(categorySlug, 5),
    enabled: isHovering, // Only fetch when hovering
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const articles = previewData?.data.articles || [];

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsHovering(false);
    }, 150); // Small delay to prevent flickering
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {/* Category Link */}
      <Link
        to={`/category/${categorySlug}`}
        className={cn(
          "text-sm font-medium transition-all duration-300 relative",
          "hover:text-primary hover:scale-110",
          "animate-fade-in",
          isActive
            ? "text-primary border-b-2 border-primary pb-1"
            : "text-foreground/80"
        )}
      >
        {categoryName}
      </Link>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Latest in {categoryName}</h3>
              <Link 
                to={`/category/${categorySlug}`}
                className="text-xs text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`}
                    className="flex gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {article.thumbnailUrl ? (
                        <LazyImage
                          src={article.thumbnailUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground font-medium">
                            {categoryName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Article Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {article.author && (
                          <span className="text-xs text-muted-foreground">
                            {article.author.name}
                          </span>
                        )}
                        {article.publishedAt && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No articles available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};