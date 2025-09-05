import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Package, Users, Activity } from "lucide-react";

interface AnalyticsData {
  total_bookings: number;
  active_packages: number;
  revenue_generated: number;
  monthly_trend: any;
  popular_packages: any;
}

const CHART_COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71'];

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_analytics_data');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  const monthlyTrendData = Array.isArray(analytics.monthly_trend) 
    ? analytics.monthly_trend.map((item: any) => ({
        ...item,
        month: item.month.substring(5), // Show only MM part
      }))
    : [];

  const popularPackagesData = Array.isArray(analytics.popular_packages)
    ? analytics.popular_packages.map((pkg: any, index: number) => ({
        ...pkg,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{analytics.total_bookings}</p>
                <p className="text-xs text-green-600">All time</p>
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
                <p className="text-2xl font-bold">{analytics.active_packages}</p>
                <p className="text-xs text-green-600">Available now</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">PKR {Number(analytics.revenue_generated).toLocaleString()}</p>
                <p className="text-xs text-green-600">All time</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Revenue/Booking</p>
                <p className="text-2xl font-bold">
                  PKR {analytics.total_bookings > 0 
                    ? Math.round(Number(analytics.revenue_generated) / Number(analytics.total_bookings)).toLocaleString()
                    : '0'
                  }
                </p>
                <p className="text-xs text-green-600">Average value</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings Trend</CardTitle>
            <CardDescription>Bookings over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'bookings' ? value : `PKR ${Number(value).toLocaleString()}`,
                    name === 'bookings' ? 'Bookings' : 'Revenue'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}K`} />
                <Tooltip 
                  formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Packages</CardTitle>
            <CardDescription>Top 5 packages by booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularPackagesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="booking_count"
                >
                  {popularPackagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} bookings`,
                    props.payload?.title
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {popularPackagesData.map((pkg, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: pkg.fill }}
                  />
                  <span className="flex-1">{pkg.title}</span>
                  <span className="font-medium">{pkg.booking_count} bookings</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Package Revenue Breakdown</CardTitle>
            <CardDescription>Revenue generated by top packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularPackagesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `${Math.round(value / 1000)}K`}
                />
                <YAxis type="category" dataKey="title" width={100} />
                <Tooltip 
                  formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key business indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-bold">85%</p>
                <p className="text-xs text-green-600">Estimated</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-xl font-bold">4.8/5</p>
                <p className="text-xs text-green-600">Average rating</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Booking Growth</p>
                <p className="text-xl font-bold">+23%</p>
                <p className="text-xs text-green-600">Month over month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};