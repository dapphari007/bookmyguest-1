import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mic, ArrowRight } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"organizer" | "speaker">("organizer");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="pt-24 min-h-screen bg-muted/30">
        <div className="container-tight py-12">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to BookMyGuest
              </h1>
              <p className="text-muted-foreground">
                Connect with top speakers or showcase your expertise
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <Label>I want to...</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value) => setRole(value as "organizer" | "speaker")}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem
                            value="organizer"
                            id="organizer"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="organizer"
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-muted cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                          >
                            <User className="w-8 h-8 text-primary" />
                            <span className="font-medium">Book Speakers</span>
                            <span className="text-xs text-muted-foreground text-center">
                              Find & hire speakers
                            </span>
                          </Label>
                        </div>

                        <div className="relative">
                          <RadioGroupItem
                            value="speaker"
                            id="speaker"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="speaker"
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-muted cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                          >
                            <Mic className="w-8 h-8 text-primary" />
                            <span className="font-medium">Become a Speaker</span>
                            <span className="text-xs text-muted-foreground text-center">
                              List your profile
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
