import { Header } from "@/components/Header";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  PartyPopper,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    signOut();
  };

  const handleAuthenticated = () => {
    setShowAuthModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+92 300 1234567", "+92 321 9876543"],
      action: "Call us now"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@partyplan.pk", "support@partyplan.pk"],
      action: "Send email"
    },
    {
      icon: MapPin,
      title: "Office Address",
      details: ["123 Party Street, DHA Phase 5", "Lahore, Punjab, Pakistan"],
      action: "Get directions"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 8:00 PM", "Saturday - Sunday: 10:00 AM - 6:00 PM"],
      action: "Plan your visit"
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
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-party-pink via-party-purple to-party-blue bg-clip-text text-transparent">
              Contact Us
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our party planning services? We're here to help make your celebration unforgettable. 
            Get in touch with our friendly team today!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="p-6">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                <Send className="h-6 w-6 mr-2 text-primary" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Party planning inquiry"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your party plans, preferred dates, number of guests, and any special requirements..."
                    className="min-h-32"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" variant="hero">
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Choose the best way to reach us. We're always ready to help plan your perfect party!
              </p>
            </div>

            {contactInfo.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground mb-1">{detail}</p>
                      ))}
                      <Button variant="link" className="p-0 h-auto text-primary">
                        {item.action}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Student Team Section */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold ml-4">Our Student Team</h3>
              </div>
              <p className="text-muted-foreground mb-6">Meet our dedicated student team members who are here to help with your party planning needs.</p>
              
              <div className="space-y-4">
                {/* Student 1 */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-lg mb-2">Hira Abdul Raheem</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">0331-7027004</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">muhammadhuzaifa657920@gmail.com</span>
                    </div>
                  </div>
                </div>

                {/* Student 2 */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold text-lg mb-2">Uzma Ijaz</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">0309-5821042</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">uzmajaffri13@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Stay updated with our latest party ideas and offers
              </p>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
          <PartyPopper className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our party planning experts are available for urgent inquiries and last-minute bookings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-primary">
              <Phone className="h-5 w-5 mr-2" />
              Call Now: +92 300 1234567
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              <MessageSquare className="h-5 w-5 mr-2" />
              Live Chat Support
            </Button>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
};

export default Contact;