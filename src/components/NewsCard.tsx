import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { LazyImage } from "./LazyImage";

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  imageAlt?: string;
  slug?: string;
  author?: {
    name: string;
    role?: string;
  };
  featured?: boolean;
  animationDelay?: number;
}

const NewsCard = ({ 
  id, 
  title, 
  excerpt, 
  category, 
  date, 
  image, 
  imageAlt,
  slug,
  author,
  featured = false,
  animationDelay = 0 
}: NewsCardProps) => {
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeFormatted = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return { dateFormatted, timeFormatted };
  };

  const { dateFormatted, timeFormatted } = formatDateTime(date);
  return (
    <Link 
      to={slug ? `/articles/${slug}` : `/news/${id}`} 
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        featured ? "lg:col-span-2" : ""
      )}>
        <div className={cn(
          "relative overflow-hidden bg-muted",
          featured ? "h-64 lg:h-80" : "h-48"
        )}>
          <LazyImage
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            useIntersectionObserver={true}
            threshold={0.1}
            rootMargin="100px"
          />
          <div className="absolute top-4 left-4 animate-scale-in" style={{ animationDelay: `${animationDelay + 200}ms` }}>
            <Badge className="bg-primary text-primary-foreground shadow-md">
              {category}
            </Badge>
          </div>
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader className="pb-3">
          <h3 className={cn(
            "font-headline font-bold leading-tight transition-colors duration-300",
            "group-hover:text-primary",
            featured ? "text-3xl font-extrabold" : "text-xl font-bold"
          )}>
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {excerpt}
          </p>
          
          {/* Author Information */}
          {author && (
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground/80">
                By {author.name}
              </p>
              {author.role && (
                <p className="text-xs text-muted-foreground font-light">
                  {author.role}
                </p>
              )}
            </div>
          )}
          
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <div className="flex flex-col">
              <span className="font-medium">{dateFormatted}</span>
              <span className="text-xs opacity-75">{timeFormatted}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;
