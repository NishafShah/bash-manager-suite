import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  id: string;
  event_date: string;
  guest_count: number;
  total_amount: number;
  status: string;
  special_requests: string;
  service_packages: {
    title: string;
    description: string;
  };
}

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            event_date,
            guest_count,
            total_amount,
            status,
            special_requests,
            service_packages (
              title,
              description
            )
          `)
          .eq('id', bookingId)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
          toast({
            title: "Error",
            description: "Failed to load booking details",
            variant: "destructive",
          });
          return;
        }

        setBooking(data);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Booking Not Found</CardTitle>
            <CardDescription>
              We couldn't find the booking you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription className="text-lg">
            Your booking has been confirmed. We're excited to help make your event amazing!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold">{booking.service_packages.title}</h3>
            <p className="text-muted-foreground">{booking.service_packages.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Event Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Guest Count</p>
                  <p className="text-sm text-muted-foreground">{booking.guest_count} guests</p>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <div>
                <p className="font-medium">Special Requests</p>
                <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount Paid</span>
                <span className="text-xl font-bold text-primary">${booking.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Booking Reference */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm font-medium">Booking Reference</p>
            <p className="text-xs text-muted-foreground font-mono">{booking.id}</p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Our team will contact you 3-5 days before your event</li>
              <li>• Any questions? Contact us at support@partyplanner.com</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <Link to="/">Return Home</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}