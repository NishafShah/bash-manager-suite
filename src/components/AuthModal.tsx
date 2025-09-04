import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartyPopper, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AuthModal = ({ isOpen, onClose, onAuthenticated }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [lastSignupEmail, setLastSignupEmail] = useState<string>('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });
      
      onAuthenticated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async (email?: string) => {
    const emailToResend = email || lastSignupEmail;
    if (!emailToResend) {
      toast({
        title: "Email Required",
        description: "Please provide an email address to resend confirmation.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('resend-confirmation', {
        body: { email: emailToResend }
      });

      if (error) {
        throw new Error(error.message || "Failed to resend confirmation");
      }

      if (data.error) {
        if (data.code === 'EMAIL_ALREADY_CONFIRMED') {
          toast({
            title: "Email Already Verified",
            description: "This email is already verified. Please login.",
            variant: "destructive",
          });
        } else if (data.code === 'USER_NOT_FOUND') {
          toast({
            title: "Account Not Found",
            description: "No account found with this email address. Please sign up first.",
            variant: "destructive",
          });
        } else if (data.code === 'RATE_LIMITED') {
          toast({
            title: "Too Many Requests",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Send Failed",
            description: "Unable to send verification email. Please try again later.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Email Sent!",
        description: "Verification email sent! Please check your inbox and spam folder.",
      });

    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Failed to Resend",
        description: "Unable to send verification email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    
    // Store email for potential resend confirmation
    setLastSignupEmail(email);
    
    try {
      // Split fullname into first_name and last_name
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ') || null;
      
      // Use the validation edge function
      const { data, error } = await supabase.functions.invoke('validate-signup', {
        body: {
          email,
          password,
          userData: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || null
          }
        }
      });

      if (error) {
        console.error('Validation function error:', error);
        throw new Error(error.message || "Failed to create account");
      }

      if (data.error) {
        if (data.code === 'EMAIL_EXISTS') {
          toast({
            title: "Email Already Registered",
            description: data.error,
            variant: "destructive",
          });
          // Show resend button in the UI
          return;
        }
        throw new Error(data.error);
      }

      // Success case
      toast({
        title: "Account Created!",
        description: data.message || "Please check your email to verify your account.",
      });
      
      // Only call onAuthenticated if the email is already confirmed
      if (data.user?.email_confirmed_at) {
        onAuthenticated();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already') || 
          error.message?.includes('exists') || 
          error.message?.includes('registered') ||
          error.status === 422) {
        toast({
          title: "Email Already Registered",
          description: "This email is already registered. Please login or use another email.",
          variant: "destructive",
        });
      } else if (error.message?.includes('email')) {
        toast({
          title: "Email Error",
          description: "There was an issue with the email service. Please try again or contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign Up Failed", 
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-party-pink to-party-blue p-3 rounded-full">
              <PartyPopper className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome to PartyPlan</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to start planning amazing parties!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>Create your account to start booking parties!</p>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="party" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Resend Confirmation Button */}
            {lastSignupEmail && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the confirmation email?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResendConfirmation()}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};