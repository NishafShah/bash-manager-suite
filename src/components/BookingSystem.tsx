import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Package {
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

interface BookingSystemProps {
  selectedPackage: Package;
  onClose: () => void;
}

export default function BookingSystem({ selectedPackage, onClose }: BookingSystemProps) {
  const [eventDate, setEventDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const totalAmount = selectedPackage.price * guestCount;

  const handleCreateBooking = async () => {
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

      if (!eventDate) {
        toast({
          title: "Date Required",
          description: "Please select an event date.",
          variant: "destructive",
        });
        return;
      }

      // Create booking
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          package_id: selectedPackage.id,
          event_date: format(eventDate, 'yyyy-MM-dd'),
          guest_count: guestCount,
          special_requests: specialRequests || null,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }

      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully. Proceeding to payment...",
      });

      // Proceed to payment
      await handlePayment(data.booking.id);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePayment = async (bookingId: string) => {
    try {
      setIsProcessingPayment(true);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          booking_id: bookingId,
          success_url: `${window.location.origin}/booking-success?booking_id=${bookingId}`,
          cancel_url: `${window.location.origin}/booking-canceled?booking_id=${bookingId}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{selectedPackage.title}</CardTitle>
              <CardDescription className="mt-2">{selectedPackage.description}</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Package Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{selectedPackage.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Up to {selectedPackage.capacity} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">{selectedPackage.rating} ({selectedPackage.review_count} reviews)</span>
            </div>
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="event-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Select event date"}
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
            <Label htmlFor="guest-count">Number of Guests</Label>
            <Input
              id="guest-count"
              type="number"
              min="1"
              max={selectedPackage.capacity}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special-requests">Special Requests (Optional)</Label>
            <Textarea
              id="special-requests"
              placeholder="Any special requirements or requests..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                ${selectedPackage.price} × {guestCount} guest{guestCount > 1 ? 's' : ''}
              </span>
              <span className="font-semibold">${totalAmount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBooking}
              disabled={isCreatingBooking || isProcessingPayment || !eventDate}
              className="flex-1"
            >
              {isCreatingBooking ? "Creating Booking..." : 
               isProcessingPayment ? "Processing Payment..." :
               "Book & Pay Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}