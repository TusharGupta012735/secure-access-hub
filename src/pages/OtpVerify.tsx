import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const OtpVerify = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isLoading, error, clearError } = useAuthStore();

  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  if (!email) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!otp || otp.length < 4) {
      setLocalError("Please enter a valid OTP.");
      return;
    }

    try {
      await verifyOtp(email, otp);
      toast({
        title: "Success",
        description: "Email verified successfully! You can now login.",
      });
      navigate("/login");
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleResendOtp = async () => {
    setLocalError(null);
    clearError();

    try {
      await resendOtp(email);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email.",
      });
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-md mx-auto">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification code to {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {(localError || error) && (
                  <div className="text-sm text-destructive">
                    {localError || error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !otp}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center text-sm">
                  <p className="text-muted-foreground">Didn't receive code?</p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCountdown > 0}
                  >
                    {resendCountdown > 0
                      ? `Resend in ${resendCountdown}s`
                      : "Resend OTP"}
                  </Button>
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

export default OtpVerify;
