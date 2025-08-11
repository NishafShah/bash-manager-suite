import { Button } from "@/components/ui/button";
import { PartyPopper, Calendar, Star, Users } from "lucide-react";
import heroImage from "@/assets/party-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <PartyPopper className="h-5 w-5 text-party-orange" />
            <span className="text-sm font-medium">Your Dream Party Awaits</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Plan the Perfect
            <span className="block bg-gradient-to-r from-party-pink to-party-blue bg-clip-text text-transparent">
              Birthday Party
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations, we'll help you create unforgettable memories 
            with our comprehensive party planning services.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-party-pink" />
              <span className="text-lg">500+ Events Planned</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-party-orange" />
              <span className="text-lg">4.9★ Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-party-blue" />
              <span className="text-lg">10K+ Happy Customers</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Start Planning Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
            >
              View Packages
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce delay-1000">
        <div className="w-4 h-4 bg-party-pink rounded-full"></div>
      </div>
      <div className="absolute top-40 right-20 animate-bounce delay-2000">
        <div className="w-6 h-6 bg-party-blue rounded-full"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-bounce">
        <div className="w-5 h-5 bg-party-orange rounded-full"></div>
      </div>
    </section>
  );
};