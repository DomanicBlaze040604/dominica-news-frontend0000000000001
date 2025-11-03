import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { articlesService } from "../services/articles";
import { categoriesService } from "../services/categories";
import { ChevronRight, Home } from "lucide-react";

const CategoryPage = () => {
  const { category = "world" } = useParams<{ category: string }>();
  const [page, setPage] = useState(1);

  // Fetch category information
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category', category],
    queryFn: () => categoriesService.getCategoryBySlug(category),
  });

  // Fetch articles for this category
  const { data: articlesData, isLoading: isLoadingArticles, error: articlesError } = useQuery({
    queryKey: ['category-articles', category, { page }],
    queryFn: () => articlesService.getCategoryArticles(category, { page, limit: 12 }),
    enabled: !!category,
  });

  const categoryInfo = categoryData?.data.category;
  const articles = articlesData?.data.articles || [];
  const pagination = articlesData?.data.pagination;
  const categoryTitle = categoryInfo?.name || category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <Link to="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{categoryTitle}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8 animate-fade-in">
          {isLoadingCategory ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-foreground mb-2 pb-3 border-b-4 border-primary inline-block">
                {categoryTitle}
              </h1>
              <div className="mt-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                {categoryInfo?.description ? (
                  <p className="text-muted-foreground text-lg">
                    {categoryInfo.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Latest updates and stories from {categoryTitle.toLowerCase()}
                  </p>
                )}
                {pagination && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {pagination.totalArticles} article{pagination.totalArticles !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Articles Grid */}
        {isLoadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : articlesError ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-red-600 text-lg mb-4">
              Failed to load articles for this category.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  image={article.featuredImage || ''}
                  imageAlt={article.featuredImageAlt}
                  category={article.category.name}
                  date={article.publishedAt || article.createdAt}
                  slug={article.slug}
                  animationDelay={100 * (index + 1)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground text-lg mb-4">
              No articles found in this category yet.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Browse All Articles</Link>
            </Button>
          </div>
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

export default CategoryPage;
