"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/fomi.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X, Sparkles, Check } from "lucide-react";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError("Please meet all password requirements");
      setIsLoading(false);
      return;
    }

    // TODO: Implement reset password logic
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/5 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-background/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 p-8 md:p-10">
          {/* Logo with glow effect */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
              <div className="relative bg-transparent p-4 rounded-2xl">
                <Image src={logo} alt="Fomi" className="w-10 h-10" />
              </div>
            </div>
          </div>

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  Reset your password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password to secure your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm">{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5 mb-6">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    New password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground mb-2">Password must have:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500/20" : "bg-muted"
                            }`}
                        >
                          {req.met && <Check className="h-3 w-3 text-green-500" />}
                        </div>
                        <span
                          className={`text-xs ${req.met ? "text-green-500 font-medium" : "text-muted-foreground"
                            }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                    Confirm password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-base rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Resetting password...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl" />
                    <div className="relative bg-green-500/10 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                  </div>
                </div>

                <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
                  Password reset successful!
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>

                <Link href="/login">
                  <Button
                    className="w-full h-12 font-semibold text-base rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
                  >
                    Continue to login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}