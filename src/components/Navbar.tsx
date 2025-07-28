import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Shield,
  HelpCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import ShowProfile from "./profile_components/ShowProfile";
import PrivacySafety from "./profile_components/PrivacySafety";
import Help from "./profile_components/Help";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [showProfile, setShowProfile] = useState(false);
  const [showPrivacySafety, setShowPrivacySafety] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System theme
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      if (systemTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getUserInitials = () => {
    if (userProfile?.username) {
      return userProfile.username
        .split(" ")
        .map((name) => name.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const navigationTabs = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: "/dashboard",
    },
    {
      name: "Member Records",
      icon: <Users className="h-4 w-4" />,
      href: "/members",
    },
    {
      name: "Analytics & Insights",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/analytics",
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 mr-3">
                <img
                  src="/R-Logo.png"
                  alt="RosterXPro"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  RosterXPro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enterprise Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationTabs.map((tab) => {
              const isActive = location.pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme and Profile */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {getThemeIcon()}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userProfile?.profile_image_url || ""}
                      alt={userProfile?.username || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile?.username || user?.email || "User"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowPrivacySafety(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy and Safety
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHelp(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-gray-500 dark:text-gray-400 cursor-default">
                  Version: 1.0.e.270725
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationTabs.map((tab) => {
              const isActive = location.pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Popup */}
      <ShowProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* Privacy & Safety Popup */}
      <PrivacySafety
        isOpen={showPrivacySafety}
        onClose={() => setShowPrivacySafety(false)}
      />

      {/* Help Popup */}
      <Help isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </nav>
  );
};
