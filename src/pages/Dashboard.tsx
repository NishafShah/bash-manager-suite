import { useState } from "react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  User, 
  MapPin,
  PartyPopper,
  Star,
  Badge as BadgeIcon,
  Phone,
  Mail
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
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

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={false}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <PartyPopper className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground mb-8">Please sign in to access your dashboard</p>
          <Button onClick={handleLogin} variant="hero" size="lg">
            Sign In
          </Button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }

  // Mock data for demonstration
  const upcomingBookings = [
    {
      id: 1,
      package: "Premium Birthday Package",
      date: "2024-02-15",
      time: "14:00",
      venue: "Central Park Hall",
      status: "confirmed",
      amount: "PKR 45,000"
    },
    {
      id: 2,
      package: "Kids Party Special",
      date: "2024-02-28",
      time: "16:00",
      venue: "Rainbow Garden",
      status: "pending",
      amount: "PKR 25,000"
    }
  ];

  const recentBookings = [
    {
      id: 3,
      package: "Basic Party Package",
      date: "2024-01-10",
      status: "completed",
      rating: 5,
      amount: "PKR 18,000"
    },
    {
      id: 4,
      package: "Deluxe Birthday Experience",
      date: "2023-12-20",
      status: "completed",
      rating: 4,
      amount: "PKR 35,000"
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <PartyPopper className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">My Dashboard</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Events</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">₹1,23,000</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold">4.5</p>
                    </div>
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your scheduled party bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                          <PartyPopper className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{booking.package}</p>
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {booking.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {booking.time}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.venue}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{booking.amount}</p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{booking.package}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {booking.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.venue}
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {booking.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{booking.package}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < booking.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <Badge variant="outline">{booking.status}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.date}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {booking.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Welcome!</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="flex items-center p-3 border rounded-lg bg-muted">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Member Since</label>
                      <div className="flex items-center p-3 border rounded-lg bg-muted">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-fit">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...upcomingBookings, ...recentBookings].map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{booking.package}</p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{booking.amount}</p>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status === 'completed' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;