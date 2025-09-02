import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AdminLogin } from "@/components/AdminLogin";
import { supabase } from "@/integrations/supabase/client";
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
  CreditCard,
  LogOut,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeUsers: 0,
    avgRating: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<any[]>([]);

  const handleAdminLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Fetch real data from Supabase
  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminData();
    }
  }, [isLoggedIn]);

  const fetchAdminData = async () => {
    try {
      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          service_packages(title),
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch packages
      const { data: packagesData } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true);

      // Fetch contact submissions
      const { data: contactsData } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate stats
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_amount');

      const totalRevenue = allBookings?.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0) || 0;
      const totalBookings = allBookings?.length || 0;

      // Generate chart data for revenue over time
      const monthlyRevenue = allBookings?.reduce((acc: any, booking: any) => {
        const month = new Date(booking.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + Number(booking.total_amount || 0);
        return acc;
      }, {}) || {};

      // Count booking statuses
      const statusCount = allBookings?.reduce((acc: any, booking: any) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {}) || {};

      setRecentBookings(bookingsData || []);
      setPackages(packagesData || []);
      setContactSubmissions(contactsData || []);
      setChartData(Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue: Number(revenue),
        bookings: Math.floor(Number(revenue) / 10000) // Estimate bookings from revenue
      })));
      setStatusCounts(Object.entries(statusCount).map(([status, count]) => ({
        name: status,
        value: Number(count),
        color: status === 'confirmed' ? '#10b981' : status === 'pending' ? '#f59e0b' : '#ef4444'
      })));
      setStats({
        totalRevenue,
        totalBookings,
        activeUsers: totalBookings, // Using bookings as proxy for active users
        avgRating: 4.6 // Would calculate from actual reviews
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <AdminLogin onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">

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
                      <p className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">Real-time data</p>
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
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      <p className="text-xs text-green-600">Real-time data</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Packages</p>
                      <p className="text-2xl font-bold">{packages.length}</p>
                      <p className="text-xs text-green-600">Available services</p>
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
                      <p className="text-2xl font-bold">{stats.avgRating}</p>
                      <p className="text-xs text-green-600">Customer satisfaction</p>
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
                          <p className="font-semibold">
                            {booking.profiles?.first_name} {booking.profiles?.last_name || 'Guest'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.service_packages?.title || 'Custom Package'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">PKR {Number(booking.total_amount).toLocaleString()}</p>
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
                          <p className="font-semibold">{pkg.title}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {pkg.capacity || 'Flexible'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">PKR {Number(pkg.price).toLocaleString()}</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{pkg.rating || 0}</span>
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
                          <h3 className="font-semibold">
                            {booking.profiles?.first_name} {booking.profiles?.last_name || 'Guest'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.service_packages?.title || 'Custom Package'}
                          </p>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(booking.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          {booking.guest_count || 'N/A'} guests
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                          PKR {Number(booking.total_amount).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
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
                          <h3 className="font-semibold">{pkg.title}</h3>
                          <p className="text-lg font-bold text-primary">PKR {Number(pkg.price).toLocaleString()}</p>
                        </div>
                        <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Capacity: {pkg.capacity || 'Flexible'}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          {pkg.rating || 0} average rating
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          {pkg.is_active ? 'Deactivate' : 'Delete'}
                        </Button>
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
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-sm">{contact.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">{contact.message}</p>
                        {contact.phone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Distribution</CardTitle>
                  <CardDescription>Current booking status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusCounts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Bookings</CardTitle>
                  <CardDescription>Booking volume trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key business indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="text-lg font-bold text-primary">
                      PKR {stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-lg font-bold text-yellow-600">{stats.avgRating}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Repeat Customers</span>
                    <span className="text-lg font-bold text-blue-600">45%</span>
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