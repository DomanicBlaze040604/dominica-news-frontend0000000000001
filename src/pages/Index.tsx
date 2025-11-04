import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/NewsCard";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articlesService } from "../services/articles";
import { categoriesService } from "../services/categories";
import { useSiteSetting } from "../hooks/useSiteSettings";
import FeaturedSectionCards from "../components/FeaturedSectionCards";
import FeaturedSectionSingle from "../components/FeaturedSectionSingle";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { Search, X } from "lucide-react";

const Index = () => {
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update local search when URL changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Fetch pinned articles for featured section
  const { data: pinnedData, isLoading: isLoadingPinned } = useQuery({
    queryKey: ['pinned-articles'],
    queryFn: () => articlesService.getPinnedArticles(3),
    enabled: !searchQuery, // Only fetch when not searching
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch latest articles
  const { data: latestData, isLoading: isLoadingLatest, error: articlesError } = useQuery({
    queryKey: ['latest-articles', { page, limit: 9, search: searchQuery }],
    queryFn: async () => {
      if (searchQuery) {
        return articlesService.getPublishedArticles({ page, limit: 9 });
      } else {
        return articlesService.getLatestArticles({ limit: 9, excludePinned: true });
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch featured section layout setting
  const { data: layoutSetting } = useSiteSetting('featured_section_layout');

  const pinnedArticles = pinnedData?.data?.articles || pinnedData?.data || [];
  const latestArticles = (latestData as any)?.data?.articles || (latestData as any)?.data || [];
  const categories = categoriesData?.data?.categories || categoriesData?.data || [];
  const pagination = (latestData as any)?.data?.pagination;
  
  // Determine layout type - default to 'single' if not set
  const layoutType = layoutSetting?.data?.value || 'single';

  // Use pinned articles for featured section, fallback to latest
  const featuredArticles = searchQuery ? latestArticles : pinnedArticles;
  const isLoadingArticles = searchQuery ? isLoadingLatest : (isLoadingPinned || isLoadingLatest);

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchParams({ search: localSearchQuery.trim() });
      setPage(1);
    }
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSearchParams({});
    setPage(1);
  };

  // Filter articles based on search query (client-side filtering for now)
  const filteredArticles = searchQuery 
    ? latestArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : latestArticles;
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags for Homepage */}
      <MetaTags />
      <Header>
        <Navbar />
      </Header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        {searchQuery && (
          <section className="mb-8 animate-fade-in">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  Search Results for "{searchQuery}"
                </h2>
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              </div>
              <p className="text-muted-foreground">
                Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </section>
        )}

        {/* Search Bar (Alternative) */}
        <section className="mb-8 animate-fade-in">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </section>

        {/* Latest News Section - Now comes first */}
        <section className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-headline font-extrabold text-foreground pb-2 border-b-2 border-primary inline-block">
              {searchQuery ? 'Search Results' : 'Latest News'}
            </h2>
            {!searchQuery && pagination && pagination.totalPages > 1 && (
              <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                View All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingArticles ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                </div>
              ))
            ) : filteredArticles.length > 0 ? (
              (searchQuery ? filteredArticles : latestArticles.slice(0, 6)).map((article, index) => (
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
                  author={article.author}
                  animationDelay={100 * (index + 1)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">
                  {searchQuery ? `No articles found for "${searchQuery}"` : 'No articles available.'}
                </p>
                {searchQuery && (
                  <Button onClick={clearSearch} variant="outline" className="mt-4">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Load More Button - Only show if not searching */}
          {!searchQuery && pagination && pagination.hasNextPage && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setPage(page + 1)}
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Load More Articles
              </Button>
            </div>
          )}
        </section>

        {/* Featured/Pinned Section - Now comes after Latest News */}
        {!searchQuery && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-4xl font-headline font-extrabold text-foreground mb-6 pb-2 border-b-2 border-primary inline-block">
              Featured Stories
            </h2>
            <div className="mt-6">
              {articlesError ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Failed to load articles. Please try again later.</p>
                </div>
              ) : layoutType === 'cards' ? (
                <FeaturedSectionCards 
                  articles={featuredArticles} 
                  isLoading={isLoadingPinned} 
                />
              ) : (
                <FeaturedSectionSingle 
                  articles={featuredArticles} 
                  isLoading={isLoadingPinned} 
                />
              )}
            </div>
          </section>
        )}



        {/* Social Media Section */}
        <section className="mt-12 py-8 bg-primary/5 rounded-lg animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-headline font-bold text-foreground mb-2">
              Follow Us On
            </h2>
            <p className="text-muted-foreground mb-6">
              Stay connected with us on social media for the latest updates and breaking news
            </p>
            
            <div className="flex justify-center items-center gap-6">
              {/* Facebook */}
              <a
                href="https://facebook.com/dominicanews"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-[#1877F2] text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href="https://twitter.com/dominicanews"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-[#000000] text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/dominicanews"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@dominicanews"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-[#FF0000] text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Subscribe to our YouTube channel"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/17671234567"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-[#25D366] text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Contact us on WhatsApp"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Categories Quick Access */}
        <section className="mt-12 py-8 bg-secondary/30 rounded-lg animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-headline font-bold text-foreground mb-2">
              Explore by Category
            </h2>
            <p className="text-muted-foreground">
              Stay informed with news from across Dominica and the world
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
            {categories.slice(0, 8).map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-20 text-lg font-semibold hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link to={`/category/${category.slug}`}>
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
