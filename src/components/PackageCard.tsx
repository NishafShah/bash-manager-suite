import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, CheckCircle } from "lucide-react";

interface PackageCardProps {
  title: string;
  price: number;
  originalPrice?: number;
  duration: string;
  capacity: string;
  rating: number;
  reviews: number;
  features: string[];
  image: string;
  popular?: boolean;
  onBook?: () => void;
}

export const PackageCard = ({
  title,
  price,
  originalPrice,
  duration,
  capacity,
  rating,
  reviews,
  features,
  image,
  popular = false,
  onBook
}: PackageCardProps) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      {popular && (
        <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-party-orange to-party-pink text-white">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Price Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">${price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">per event</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-party-orange text-party-orange" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{capacity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-sm text-foreground">What's included:</p>
          <ul className="space-y-1">
            {features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-party-blue flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-sm text-party-pink font-medium">
                +{features.length - 4} more features
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          variant="party" 
          className="w-full" 
          onClick={onBook}
        >
          Book This Package
        </Button>
      </CardFooter>
    </Card>
  );
};