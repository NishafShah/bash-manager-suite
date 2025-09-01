import { useState } from "react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Settings,
  PartyPopper,
  Package,
  Mail,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPanel = () => {
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

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || false;

  // Redirect if not authenticated or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={false}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <Settings className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">Please sign in to access the admin panel</p>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={!!user}
          isAdmin={isAdmin}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">You don't have permission to access this area</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const recentBookings = [
    {
      id: 1,
      customer: "John Doe",
      email: "john@example.com",
      package: "Premium Birthday Package",
      date: "2024-02-15",
      amount: "PKR 45,000",
      status: "confirmed"
    },
    {
      id: 2,
      customer: "Jane Smith",
      email: "jane@example.com",
      package: "Kids Party Special",
      date: "2024-02-28",
      amount: "PKR 25,000",
      status: "pending"
    },
    {
      id: 3,
      customer: "Bob Johnson",
      email: "bob@example.com",
      package: "Deluxe Birthday Experience",
      date: "2024-03-05",
      amount: "PKR 35,000",
      status: "confirmed"
    }
  ];

  const packages = [
    {
      id: 1,
      name: "Basic Party Package",
      price: "PKR 18,000",
      bookings: 45,
      rating: 4.2,
      status: "active"
    },
    {
      id: 2,
      name: "Premium Birthday Package",
      price: "PKR 45,000",
      bookings: 32,
      rating: 4.8,
      status: "active"
    },
    {
      id: 3,
      name: "Kids Party Special",
      price: "PKR 25,000",
      bookings: 28,
      rating: 4.5,
      status: "active"
    }
  ];

  const contactSubmissions = [
    {
      id: 1,
      name: "Alice Brown",
      email: "alice@example.com",
      subject: "Wedding Planning Inquiry",
      message: "Looking for wedding planning services...",
      date: "2024-01-20",
      status: "new"
    },
    {
      id: 2,
      name: "Mike Wilson",
      email: "mike@example.com",
      subject: "Corporate Event",
      message: "Need help planning a corporate event...",
      date: "2024-01-19",
      status: "responded"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Settings className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹5,67,000</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-xs text-green-600">+8% from last month</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">89</p>
                      <p className="text-xs text-green-600">+15% from last month</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold">4.6</p>
                      <p className="text-xs text-green-600">+0.2 from last month</p>
                    </div>
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest customer bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{booking.customer}</p>
                          <p className="text-sm text-muted-foreground">{booking.package}</p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Popular Packages</CardTitle>
                  <CardDescription>Most booked packages this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {packages.slice(0, 3).map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{pkg.name}</p>
                          <p className="text-sm text-muted-foreground">{pkg.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{pkg.price}</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{pkg.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Manage customer bookings</CardDescription>
                  </div>
                  <Button>Export Data</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{booking.customer}</h3>
                          <p className="text-sm text-muted-foreground">{booking.email}</p>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          {booking.package}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {booking.date}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          {booking.amount}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Update Status</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Packages</CardTitle>
                    <CardDescription>Manage your service offerings</CardDescription>
                  </div>
                  <Button variant="hero">Add New Package</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{pkg.name}</h3>
                          <p className="text-lg font-bold text-primary">{pkg.price}</p>
                        </div>
                        <Badge variant="outline">{pkg.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {pkg.bookings} total bookings
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          {pkg.rating} average rating
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit Package</Button>
                        <Button size="sm" variant="outline">View Analytics</Button>
                        <Button size="sm" variant="destructive">Deactivate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Submissions</CardTitle>
                <CardDescription>Customer inquiries and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactSubmissions.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{contact.date}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-sm">{contact.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">{contact.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Reply</Button>
                        <Button size="sm" variant="outline">Mark as Read</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Revenue chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Analytics</CardTitle>
                  <CardDescription>Booking trends and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Booking analytics would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;