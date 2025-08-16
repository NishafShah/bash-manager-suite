import { PackageCard } from "@/components/PackageCard";
import BookingSystem from "@/components/BookingSystem";
import { useState } from "react";

// Mock data for packages
const packages = [
  {
    id: 1,
    title: "Essential Birthday Package",
    price: 299,
    originalPrice: 399,
    duration: "4 hours",
    capacity: "Up to 15 guests",
    rating: 4.8,
    reviews: 124,
    features: [
      "Professional decoration setup",
      "Birthday cake (vanilla/chocolate)",
      "Party supplies & balloons",
      "Music system with playlist",
      "Photography session (1 hour)",
      "Cleanup service"
    ],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    title: "Premium Celebration",
    price: 599,
    originalPrice: 799,
    duration: "6 hours",
    capacity: "Up to 30 guests",
    rating: 4.9,
    reviews: 89,
    features: [
      "Luxury themed decorations",
      "Custom birthday cake design",
      "Professional photographer",
      "DJ & sound system",
      "Catering service included",
      "Party games & entertainment",
      "Personalized party favors",
      "Dedicated event coordinator"
    ],
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    popular: true
  },
  {
    id: 3,
    title: "Ultimate Party Experience",
    price: 999,
    duration: "8 hours",
    capacity: "Up to 50 guests",
    rating: 5.0,
    reviews: 67,
    features: [
      "Premium venue decoration",
      "Multi-tier custom cake",
      "Professional photo & video",
      "Live entertainment/magician",
      "Full catering menu",
      "Party coordinator team",
      "Custom party themes",
      "Post-event video highlights",
      "Gift wrapping service",
      "Transport arrangements"
    ],
    image: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

export const PackagesSection = () => {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const handleBookPackage = (packageId: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      // Convert to BookingSystem expected format
      const bookingPackage = {
        id: pkg.id.toString(),
        title: pkg.title,
        description: `${pkg.duration} celebration package for up to ${pkg.capacity.split(' ')[2]} guests`,
        price: pkg.price,
        duration: pkg.duration,
        capacity: parseInt(pkg.capacity.split(' ')[2]) || 15,
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

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              title={pkg.title}
              price={pkg.price}
              originalPrice={pkg.originalPrice}
              duration={pkg.duration}
              capacity={pkg.capacity}
              rating={pkg.rating}
              reviews={pkg.reviews}
              features={pkg.features}
              image={pkg.image}
              popular={pkg.popular}
              onBook={() => handleBookPackage(pkg.id)}
            />
          ))}
        </div>

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