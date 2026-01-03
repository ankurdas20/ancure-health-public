import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AdminRoute } from "./components/AdminRoute";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Track = lazy(() => import("./pages/Track"));
const Auth = lazy(() => import("./pages/Auth"));
const AncureOneWelcome = lazy(() => import("./pages/AncureOneWelcome"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Blog pages
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));

// Admin pages
const BlogDashboard = lazy(() => import("./pages/admin/BlogDashboard"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));

/**
 * Minimal loading fallback component shown during lazy loading
 */
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * React Query client configuration
 * - staleTime: Data considered fresh for 5 minutes
 * - gcTime: Unused data garbage collected after 30 minutes
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

/**
 * Main application component
 * Wraps the app with providers and error boundary
 */
const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/track" element={<Track />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/ancure-one-welcome" element={<AncureOneWelcome />} />
                  
                  {/* Blog Routes */}
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:slug" element={<BlogPost />} />
                  <Route path="/blogs/category/:slug" element={<BlogCategory />} />
                  
                  {/* Admin Blog Routes (Admin Only) */}
                  <Route path="/admin/blogs" element={
                    <AdminRoute>
                      <BlogDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/blogs/new" element={
                    <AdminRoute>
                      <BlogEditor />
                    </AdminRoute>
                  } />
                  <Route path="/admin/blogs/edit/:id" element={
                    <AdminRoute>
                      <BlogEditor />
                    </AdminRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
