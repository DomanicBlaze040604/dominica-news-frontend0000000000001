import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/NewsCard";
import { LazyImage } from "@/components/LazyImage";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articlesService } from "../services/articles";
import { ChevronRight, Home, Calendar, User, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { format } from "date-fns";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch article data
  const { data: articleData, isLoading: isLoadingArticle, error: articleError } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesService.getArticleBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch related articles
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['related-articles', slug],
    queryFn: () => articlesService.getRelatedArticles(slug!, 4),
    enabled: !!slug,
  });

  const article = articleData?.data.article;
  const relatedArticles = relatedData?.data.articles || [];

  // Share functions
  const shareUrl = window.location.href;
  const shareTitle = article?.title || '';

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
  };

  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (articleError || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Head with structured data */}
      {article && <SEOHead article={article} />}
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <Link to="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link 
            to={`/category/${article.category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {article.category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate max-w-xs">
            {article.title}
          </span>
        </nav>

        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8 animate-fade-in">
            <div className="mb-4">
              <Badge className="mb-4">
                {article.category.name}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.seoTitle || article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b pb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>By {article.author.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(article.publishedAt || article.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
              
              {/* Share Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnFacebook}
                  className="p-1 h-8 w-8"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnTwitter}
                  className="p-1 h-8 w-8"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnLinkedIn}
                  className="p-1 h-8 w-8"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="p-1 h-8 w-8"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <LazyImage
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                useIntersectionObserver={true}
                threshold={0.1}
                rootMargin="50px"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none mb-12 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="whitespace-pre-wrap leading-relaxed text-foreground">
              {article.content}
            </div>
          </div>

          {/* Article Footer */}
          <footer className="border-t pt-8 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Published in{' '}
                  <Link 
                    to={`/category/${article.category.slug}`}
                    className="text-primary hover:underline"
                  >
                    {article.category.name}
                  </Link>
                </p>
              </div>
              
              {/* Share Buttons (Mobile) */}
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-sm text-muted-foreground">Share:</span>
                <Button variant="outline" size="sm" onClick={shareOnFacebook}>
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </Button>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b-2 border-primary inline-block">
              More {article.category.name} News
            </h2>
            
            {isLoadingRelated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((relatedArticle, index) => (
                  <NewsCard
                    key={relatedArticle.id}
                    id={relatedArticle.id}
                    title={relatedArticle.title}
                    excerpt={relatedArticle.excerpt || ''}
                    image={relatedArticle.featuredImage || ''}
                    imageAlt={relatedArticle.featuredImageAlt}
                    category={relatedArticle.category.name}
                    date={relatedArticle.publishedAt || relatedArticle.createdAt}
                    slug={relatedArticle.slug}
                    animationDelay={100 * (index + 1)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">DOMINICA NEWS</h3>
            <p className="text-primary-foreground/80 text-sm">
              Your trusted source for news from Dominica and around the world
            </p>
            <p className="text-primary-foreground/60 text-xs mt-4">
              © 2025 Dominica News. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArticlePage;