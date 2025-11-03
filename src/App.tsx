import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BreakingNewsTicker } from "./components/BreakingNewsTicker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load admin components for better performance
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles").then(m => ({ default: m.AdminArticles })));
const AdminArticleEditor = lazy(() => import("./pages/admin/AdminArticleEditor").then(m => ({ default: m.AdminArticleEditor })));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminAuthors = lazy(() => import("./pages/admin/AdminAuthors").then(m => ({ default: m.AdminAuthors })));
const AdminStaticPages = lazy(() => import("./pages/admin/AdminStaticPages").then(m => ({ default: m.AdminStaticPages })));
const AdminBreakingNews = lazy(() => import("./pages/admin/AdminBreakingNews").then(m => ({ default: m.AdminBreakingNews })));
const AdminImages = lazy(() => import("./pages/admin/AdminImages").then(m => ({ default: m.AdminImages })));

// Lazy load public pages
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BreakingNewsTicker />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Article routes */}
              <Route path="/articles/:slug" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ArticlePage />
                </Suspense>
              } />
              
              {/* Dynamic category routes */}
              <Route path="/category/:category" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CategoryPage />
                </Suspense>
              } />
              
              {/* Legacy category routes for backward compatibility */}
              <Route path="/world" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CategoryPage />
                </Suspense>
              } />
              <Route path="/dominica" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CategoryPage />
                </Suspense>
              } />
              <Route path="/economy" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CategoryPage />
                </Suspense>
              } />
              <Route path="/agriculture" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CategoryPage />
                </Suspense>
              } />
              
              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route index element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                <Route path="articles" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminArticles />
                  </Suspense>
                } />
                <Route path="articles/new" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminArticleEditor />
                  </Suspense>
                } />
                <Route path="articles/:id/edit" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminArticleEditor />
                  </Suspense>
                } />
                <Route path="categories" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminCategories />
                  </Suspense>
                } />
                <Route path="authors" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminAuthors />
                  </Suspense>
                } />
                <Route path="pages" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminStaticPages />
                  </Suspense>
                } />
                <Route path="breaking-news" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminBreakingNews />
                  </Suspense>
                } />
                <Route path="images" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminImages />
                  </Suspense>
                } />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
