import { Header } from "@/components/Header";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Camera, 
  Utensils, 
  Music, 
  Palette, 
  MapPin, 
  Users,
  Clock,
  Star,
  PartyPopper
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Services = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    signOut();
  };

  const handleAuthenticated = () => {
    setShowAuthModal(false);
  };

  const services = [
    {
      id: 1,
      title: "Professional Photography",
      description: "Capture every magical moment with our professional photographers and videographers",
      icon: Camera,
      features: ["HD Photography", "Video Recording", "Photo Albums", "Digital Gallery"],
      price: "Starting from PKR 15,000",
      rating: 4.9,
      popular: true
    },
    {
      id: 2,
      title: "Catering Services",
      description: "Delicious food and refreshments for all your party guests",
      icon: Utensils,
      features: ["Birthday Cakes", "Snacks & Appetizers", "Beverages", "Custom Menus"],
      price: "Starting from PKR 25,000",
      rating: 4.8,
      popular: false
    },
    {
      id: 3,
      title: "Entertainment & DJ",
      description: "Professional DJs and entertainers to keep the party alive",
      icon: Music,
      features: ["Professional DJ", "Sound System", "Party Games", "Music Playlist"],
      price: "Starting from PKR 20,000",
      rating: 4.7,
      popular: true
    },
    {
      id: 4,
      title: "Decoration & Themes",
      description: "Beautiful decorations and themed setups for any occasion",
      icon: Palette,
      features: ["Balloon Arrangements", "Themed Decorations", "Photo Booth", "Table Setup"],
      price: "Starting from PKR 18,000",
      rating: 4.9,
      popular: false
    },
    {
      id: 5,
      title: "Venue Booking",
      description: "Premium venues for birthday celebrations of any size",
      icon: MapPin,
      features: ["Indoor & Outdoor", "Various Capacities", "Parking Available", "Fully Equipped"],
      price: "Starting from PKR 30,000",
      rating: 4.6,
      popular: false
    },
    {
      id: 6,
      title: "Event Planning",
      description: "Complete event planning and coordination services",
      icon: Users,
      features: ["Full Planning", "Timeline Management", "Vendor Coordination", "Day-of Support"],
      price: "Starting from PKR 12,000",
      rating: 4.8,
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={!!user}
        isAdmin={user?.email?.includes('admin') || false}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <PartyPopper className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-party-pink via-party-purple to-party-blue bg-clip-text text-transparent">
              Our Services
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your birthday celebration with our comprehensive party planning services. 
            From decoration to entertainment, we handle everything for a perfect celebration.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
                {service.popular && (
                  <Badge className="absolute -top-3 left-6 bg-gradient-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features Include:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-lg font-bold text-primary text-center mb-4">
                      {service.price}
                    </p>
                    <Button className="w-full" variant="hero">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Perfect Party?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let our experts handle everything while you enjoy the celebration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-primary">
              <Clock className="h-5 w-5 mr-2" />
              Get Free Consultation
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              View All Packages
            </Button>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
};

export default Services;