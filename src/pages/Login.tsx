import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Simulate success
    toast({ title: "Signed in", description: `Welcome back, ${form.email}` });
    setIsSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-md mx-auto">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Use your work email to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      name="remember"
                      checked={form.remember}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, remember: !!v }))
                      }
                    />
                    <span className="text-sm">Remember me</span>
                  </label>

                  <Link
                    to="/signup"
                    className="text-sm text-primary hover:underline"
                  >
                    Need an account?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  By signing in you agree to our{" "}
                  <Link to="#" className="underline">
                    Terms
                  </Link>
                  .
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
