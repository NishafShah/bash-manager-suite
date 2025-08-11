import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PackagesSection } from "@/components/PackagesSection";
import { AuthModal } from "@/components/AuthModal";

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={!!user}
        isAdmin={user?.isAdmin || false}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main>
        <Hero />
        <PackagesSection />
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
};

export default Index;
