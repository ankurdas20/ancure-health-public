import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LazyAuthProvider } from "./contexts/LazyAuthContext";
import Index from "./pages/Index";
import Track from "./pages/Track";
import Auth from "./pages/Auth";
import AncureOneWelcome from "./pages/AncureOneWelcome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LazyAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/track" element={<Track />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ancure-one-welcome" element={<AncureOneWelcome />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LazyAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
