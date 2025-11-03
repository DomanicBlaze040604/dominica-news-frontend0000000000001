import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
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

interface FeaturedSectionSingleProps {
  articles: Article[];
  isLoading: boolean;
}

const FeaturedSectionSingle = ({ articles, isLoading }: FeaturedSectionSingleProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const featuredArticle = articles[0];
  const formattedDate = new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link 
      to={`/articles/${featuredArticle.slug}`} 
      className="group block animate-fade-in-up"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative overflow-hidden bg-muted h-64 lg:h-80">
          <LazyImage
            src={featuredArticle.featuredImage || ''}
            alt={featuredArticle.featuredImageAlt || featuredArticle.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            useIntersectionObserver={true}
            threshold={0.1}
            rootMargin="100px"
          />
          <div className="absolute top-4 left-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <Badge className="bg-primary text-primary-foreground shadow-md">
              {featuredArticle.category.name}
            </Badge>
          </div>
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader className="pb-3">
          <h3 className="font-headline font-bold text-3xl font-extrabold leading-tight transition-colors duration-300 group-hover:text-primary">
            {featuredArticle.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {featuredArticle.excerpt || ''}
          </p>
          
          {/* Author Information */}
          <div className="mb-3">
            <p className="text-base font-medium text-foreground/80">
              By {featuredArticle.author.name}
            </p>
            {featuredArticle.author.role && (
              <p className="text-sm text-muted-foreground font-light">
                {featuredArticle.author.role}
              </p>
            )}
          </div>
          
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <div className="flex flex-col">
              <span className="font-medium">{formattedDate}</span>
              <span className="text-xs opacity-75">
                {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleTimeString('en-US', {
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
};

export default FeaturedSectionSingle;