import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users, Clock, Star, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  capacity: number;
  rating: number;
  review_count: number;
  image_url: string;
}

interface NewBookingFormProps {
  onClose: () => void;
}

export default function NewBookingForm({ onClose }: NewBookingFormProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);
  const totalAmount = selectedPackage ? selectedPackage.price * guestCount : 0;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('service_packages')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: "Error",
          description: "Failed to load packages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [toast]);

  const handleBookAndPay = async () => {
    try {
      setIsCreatingBooking(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to make a booking.",
          variant: "destructive",
        });
        return;
      }

      if (!selectedPackageId) {
        toast({
          title: "Package Required",
          description: "Please select a service package.",
          variant: "destructive",
        });
        return;
      }

      if (!eventDate) {
        toast({
          title: "Date Required",
          description: "Please select an event date.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessingPayment(true);

      // Create booking and payment session in one call
      const { data, error } = await supabase.functions.invoke('create-booking-with-payment', {
        body: {
          package_id: selectedPackageId,
          event_date: format(eventDate, 'yyyy-MM-dd'),
          guest_count: guestCount,
          special_requests: specialRequests,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        toast({
          title: "Redirecting to Payment",
          description: "Opening payment page in new tab...",
        });
        
        // Open payment in new tab
        window.open(data.url, '_blank');
        
        // Close the booking form
        onClose();
      } else {
        throw new Error('No checkout URL received from payment service');
      }

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBooking(false);
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Create New Booking
        </CardTitle>
        <CardDescription>
          Select a package and event details to create your booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Selection */}
        <div className="space-y-2">
          <Label htmlFor="package">Service Package</Label>
          <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{pkg.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ${pkg.price} • {pkg.duration} • Up to {pkg.capacity} guests
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Package Details */}
        {selectedPackage && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={selectedPackage.image_url || "/placeholder.svg"} 
                  alt={selectedPackage.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedPackage.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedPackage.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedPackage.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Up to {selectedPackage.capacity} guests
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {selectedPackage.rating} ({selectedPackage.review_count} reviews)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${selectedPackage.price}</p>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Date */}
        <div className="space-y-2">
          <Label>Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !eventDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventDate ? format(eventDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={eventDate}
                onSelect={setEventDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guest Count */}
        <div className="space-y-2">
          <Label htmlFor="guests">Number of Guests</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            max={selectedPackage?.capacity || 100}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full"
          />
          {selectedPackage && guestCount > selectedPackage.capacity && (
            <p className="text-sm text-destructive">
              Maximum capacity for this package is {selectedPackage.capacity} guests
            </p>
          )}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="requests">Special Requests (Optional)</Label>
          <Textarea
            id="requests"
            placeholder="Any special requirements or requests for your event..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Price Summary */}
        {selectedPackage && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold">${totalAmount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ${selectedPackage.price} × {guestCount} guests
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleBookAndPay}
            disabled={!selectedPackageId || !eventDate || isCreatingBooking || isProcessingPayment || (selectedPackage && guestCount > selectedPackage.capacity)}
            className="flex-1"
            variant="hero"
          >
            {isProcessingPayment ? "Processing..." : isCreatingBooking ? "Creating..." : "Book & Pay"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}