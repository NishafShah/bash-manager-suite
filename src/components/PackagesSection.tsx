import { PackageCard } from "@/components/PackageCard";
import BookingSystem from "@/components/BookingSystem";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Package {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  duration: string;
  capacity: number;
  rating: number;
  reviews: number;
  features: string[];
  image: string;
  popular?: boolean;
  description: string;
}

export const PackagesSection = () => {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .select(`
            id,
            title,
            description,
            price,
            duration,
            capacity,
            rating,
            review_count,
            image_url,
            is_popular,
            package_features (
              feature_text,
              is_included
            )
          `)
          .eq('is_active', true);

        if (error) throw error;

        const formattedPackages = data?.map(pkg => ({
          id: pkg.id,
          title: pkg.title,
          price: Number(pkg.price),
          duration: pkg.duration || "6 hours",
          capacity: pkg.capacity || 50,
          rating: Number(pkg.rating) || 4.8,
          reviews: pkg.review_count || 0,
          features: pkg.package_features?.filter(f => f.is_included).map(f => f.feature_text) || [
            "Professional decoration setup",
            "Event coordination",
            "Music system",
            "Photography session",
            "Cleanup service"
          ],
          image: pkg.image_url === "/placeholder.svg" ? 
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" : 
            pkg.image_url,
          popular: pkg.is_popular,
          description: pkg.description
        })) || [];

        setPackages(formattedPackages);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleBookPackage = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      // Convert to BookingSystem expected format
      const bookingPackage = {
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        capacity: pkg.capacity,
        rating: pkg.rating,
        review_count: pkg.reviews,
        image_url: pkg.image
      };
      setSelectedPackage(bookingPackage);
    }
  };

  const handleCloseBooking = () => {
    setSelectedPackage(null);
  };

  return (
    <section id="packages" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Perfect
            <span className="block bg-gradient-to-r from-party-pink to-party-blue bg-clip-text text-transparent">
              Party Package
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations, we have the perfect package 
            to make your birthday party unforgettable.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading packages...</p>
          </div>
        ) : (
          <>
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  title={pkg.title}
                  price={pkg.price}
                  originalPrice={pkg.originalPrice}
                  duration={pkg.duration}
                  capacity={`Up to ${pkg.capacity} guests`}
                  rating={pkg.rating}
                  reviews={pkg.reviews}
                  features={pkg.features}
                  image={pkg.image}
                  popular={pkg.popular}
                  onBook={() => handleBookPackage(pkg.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Custom Package CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-party-pink/10 to-party-blue/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need Something Custom?</h3>
            <p className="text-muted-foreground mb-6">
              Let us create a personalized package that perfectly fits your vision and budget.
            </p>
            <button className="bg-gradient-to-r from-party-purple to-party-pink text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-300">
              Request Custom Quote
            </button>
          </div>
        </div>
      </div>
      
      {selectedPackage && (
        <BookingSystem 
          selectedPackage={selectedPackage} 
          onClose={handleCloseBooking} 
        />
      )}
    </section>
  );
};