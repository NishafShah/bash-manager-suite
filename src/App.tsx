import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Contact from "./pages/Contact";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCanceled from "./pages/BookingCanceled";
import NotFound from "./pages/NotFound";
import Footer from "@/components/Footer"; // ✅ import footer

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            {/* Main Content */}
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                <Route path="/booking-canceled" element={<BookingCanceled />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* ✅ Footer at bottom */}
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
