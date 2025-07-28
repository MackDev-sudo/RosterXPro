import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { authService } from "@/lib/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Login successful - the auth context will handle the redirect
      onClose();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-400">
            Sign in to your account to access your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-9 h-9 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-9 pr-9 h-9 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToForgotPassword?.();
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister?.();
                }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
