import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function BookingCanceled() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            service_packages (
              title,
              description
            )
          `)
          .eq('id', bookingId)
          .single();

        if (!error && data) {
          setBooking(data);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleRetryPayment = () => {
    // Redirect back to the booking page to retry payment
    window.location.href = `/?retry_booking=${bookingId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-3xl text-red-600">Payment Canceled</CardTitle>
          <CardDescription className="text-lg">
            Your payment was canceled and your booking is still pending.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {booking && (
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h3 className="text-xl font-semibold">{booking.service_packages.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <p className="font-medium">Guest Count</p>
                  <p className="text-sm text-muted-foreground">{booking.guest_count} guests</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-primary">${booking.total_amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-amber-50 p-6 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">Don't Worry!</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Your booking details have been saved</li>
              <li>• You can retry the payment anytime</li>
              <li>• No charges were made to your card</li>
              <li>• Need help? Contact our support team</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            {booking && (
              <Button onClick={handleRetryPayment} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Payment
              </Button>
            )}
            <Button variant="outline" asChild className="flex-1">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}