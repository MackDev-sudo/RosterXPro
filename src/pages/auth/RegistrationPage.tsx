import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Upload,
  User,
  Mail,
  Phone,
  Lock,
  Check,
  Loader2,
} from "lucide-react";
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

import { useAuth } from "@/hooks/useAuth";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile image must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        phone: formData.phone,
        profileImage: profileImage,
      });

      // Registration successful - user needs to check email
      onClose();
      alert(
        "Registration successful! Please check your email and click the confirmation link to complete your registration."
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">
            Create Account
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-400">
            Join us to manage your team roster effectively
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Profile Picture Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Upload className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Form Fields in Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm text-slate-300">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-9 h-9 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm text-slate-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-9 h-9 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email Address
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
                  required
                />
              </div>
            </div>

            {/* Password Fields in Grid */}
            <div className="grid grid-cols-2 gap-3">
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
                    placeholder="Create a password"
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-slate-300"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-9 pr-9 h-9 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <Check className="absolute right-8 top-2.5 h-4 w-4 text-green-500" />
                    )}
                </div>
              </div>
            </div>

            {/* Password Requirements - Compact */}
            <div className="bg-slate-800/50 p-2 rounded text-xs text-slate-400 border border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  8+ characters
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Upper & lowercase
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Number
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                required
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-400 leading-tight"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin?.();
                }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
