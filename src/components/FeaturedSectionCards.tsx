import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { LazyImage } from "./LazyImage";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  category: {
    name: string;
  };
  author: {
    name: string;
    role?: string;
  };
  publishedAt?: string;
  createdAt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  slug: string;
}

interface FeaturedSectionCardsProps {
  articles: Article[];
  isLoading: boolean;
}

const FeaturedSectionCards = ({ articles, isLoading }: FeaturedSectionCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-3 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No featured articles available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.slice(0, 3).map((article, index) => {
        const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return (
          <Link 
            key={article.id}
            to={`/articles/${article.slug}`} 
            className="group block animate-fade-in-up"
            style={{ animationDelay: `${100 * (index + 1)}ms` }}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
              <div className="relative overflow-hidden bg-muted h-48">
                <LazyImage
                  src={article.featuredImage || ''}
                  alt={article.featuredImageAlt || article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  useIntersectionObserver={true}
                  threshold={0.1}
                  rootMargin="100px"
                />
                <div className="absolute top-4 left-4 animate-scale-in" style={{ animationDelay: `${100 * (index + 1) + 200}ms` }}>
                  <Badge className="bg-primary text-primary-foreground shadow-md">
                    {article.category.name}
                  </Badge>
                </div>
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <CardHeader className="pb-3">
                <h3 className="font-headline font-bold text-lg leading-tight transition-colors duration-300 group-hover:text-primary line-clamp-2">
                  {article.title}
                </h3>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {article.excerpt || ''}
                </p>
                
                {/* Author Information */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-foreground/80">
                    By {article.author.name}
                  </p>
                  {article.author.role && (
                    <p className="text-xs text-muted-foreground font-light">
                      {article.author.role}
                    </p>
                  )}
                </div>
                
                {/* Date and Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                  <Calendar className="h-3 w-3" />
                  <div className="flex flex-col">
                    <span className="font-medium">{formattedDate}</span>
                    <span className="text-xs opacity-75">
                      {new Date(article.publishedAt || article.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default FeaturedSectionCards;