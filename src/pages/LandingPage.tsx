/**
 * RosterXPro Landing Page
 *
 * @license Proprietary - All rights reserved
 * @about Enterprise workforce management platform for intelligent roster generation,
 *         automated leave tracking, and seamless team coordination
 * @version 1.0.0-beta
 * @developer Mackdev Inc.
 * @contact support@rosterxpro.com
 * @website https://rosterxpro.com
 *
 * Copyright (c) 2025 RosterXPro. Unauthorized copying, distribution, or use
 * of this software is strictly prohibited.
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  BarChart3,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Menu,
  X,
  Sparkles,
  Target,
  Award,
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
import RegistrationModal from "./auth/RegistrationPage";
import LoginModal from "./auth/LoginPage";
import { Footer } from "../components/Footer";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"forgot" | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(
    new Set()
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced Intersection Observer for bidirectional scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.getAttribute("data-animate-id");
          if (elementId) {
            if (entry.isIntersecting) {
              // Element is entering viewport
              setVisibleElements((prev) => new Set([...prev, elementId]));
            } else {
              // Element is leaving viewport (for reverse animations)
              setVisibleElements((prev) => {
                const newSet = new Set(prev);
                newSet.delete(elementId);
                return newSet;
              });
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.5, 1], // Multiple thresholds for smoother animations
        rootMargin: "-10% 0px -10% 0px", // Trigger slightly before element enters viewport
      }
    );

    // Observe all elements with data-animate-id
    const animatedElements = document.querySelectorAll("[data-animate-id]");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const ForgotPasswordForm = () => (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-forgot">Email</Label>
        <Input
          id="email-forgot"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
        />
      </div>
      <p className="text-sm text-gray-600">
        We'll send you a link to reset your password.
      </p>
      <Button type="submit" className="w-full">
        Send Reset Link
      </Button>
      <p className="text-center text-sm text-gray-600">
        Remember your password?{" "}
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="text-blue-600 hover:text-blue-700"
        >
          Sign in
        </button>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes freeFall {
          0% {
            transform: translateY(-100px) scale(0.95);
            opacity: 0;
          }
          50% {
            transform: translateY(20px) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-on-scroll-left {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animate-on-scroll-right {
          opacity: 0;
          transform: translateX(50px);
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll-right.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animate-on-scroll-scale {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll-scale.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        /* Bidirectional scroll animations */
        .animate-on-scroll-bidirectional {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll-bidirectional.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-on-scroll-fade {
          opacity: 0;
          transition: all 0.6s ease-out;
        }
        
        .animate-on-scroll-fade.visible {
          opacity: 1;
        }
        
        .animate-on-scroll-slide-up {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll-slide-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-on-scroll-slide-down {
          opacity: 0;
          transform: translateY(-50px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll-slide-down.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-on-scroll-rotate {
          opacity: 0;
          transform: rotate(-5deg) scale(0.9);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll-rotate.visible {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }
        
        .animate-on-scroll-bounce {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-on-scroll-bounce.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      `}</style>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img
                    src="R-Logo.png"
                    alt="RosterXPro Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  RosterXPro
                </span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
                  BETA
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Journey", href: "#journey" },
                { name: "Pricing", href: "#pricing" },
                { name: "Contact", href: "#contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                Start Free
              </Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-2 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#journey"
                className="block px-3 py-2 text-slate-300 hover:text-white"
              >
                Journey
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-slate-300 hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-slate-300 hover:text-white"
              >
                Contact
              </a>
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="w-full justify-start"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                Start Free
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            src="/dashboard/the-project-vid.mp4"
            className="w-full h-full object-cover opacity-70"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-slate-950/20"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-32 md:py-48">
            <div className="pb-20 text-center md:pb-32">
              <h1
                className={`animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl transition-all duration-1000 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  animationDelay: "0.2s",
                }}
              >
                Streamline Your Team Operations
              </h1>
              <div className="mx-auto max-w-3xl">
                <p
                  className={`mb-8 text-xl text-indigo-200/65 transition-all duration-1000 ${
                    isLoaded
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    animationDelay: "0.4s",
                  }}
                >
                  Intelligent roster management, automated leave tracking, and
                  seamless team coordination. Built for modern enterprises that
                  demand efficiency and precision.
                </p>
                <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                  <div
                    className={`transition-all duration-1000 ${
                      isLoaded
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{ animationDelay: "0.6s" }}
                  >
                    <Button
                      onClick={() => setShowRegistrationModal(true)}
                      className="btn group mb-4 w-full bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                    >
                      <span className="relative inline-flex items-center">
                        Start Free Trial
                        <span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
                          -&gt;
                        </span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Description */}
      <section className="relative">
        <div className="relative w-full">
          {/* Full Width Background Image */}
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
            <img
              src="/dashboard/hero-image.png"
              alt="RosterXPro Hero"
              className={`w-full h-full object-cover transform transition-all duration-1000 ease-out ${
                isLoaded
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-[-100px] opacity-0 scale-95"
              }`}
              style={{
                animation: isLoaded
                  ? "freeFall 1.5s ease-out forwards"
                  : "none",
              }}
            />

            {/* Dark Overlay for Better Text Readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Text Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`mx-auto max-w-4xl px-4 sm:px-6 text-center transition-all duration-1000 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ animationDelay: "1.2s" }}
              >
                <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                  <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                    About RosterXPro
                  </span>
                </div>
                <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-6 font-nacelle text-4xl font-semibold text-transparent md:text-5xl lg:text-6xl">
                  The Project
                </h2>
                <p className="text-sm text-white/90 max-w-3xl mx-auto leading-relaxed">
                  <b>RosterXPro</b> is an end-to-end workforce optimization
                  platform engineered to eliminate the inefficiencies of manual
                  scheduling and fragmented leave management systems.
                  Purpose-built for modern enterprises, RosterXPro empowers
                  organizations to streamline workforce operations through
                  intelligent automation, dynamic resource allocation, and
                  real-time team collaboration. With advanced analytics and
                  predictive insights, the platform enables data-driven
                  decision-making, improved compliance, and enhanced operational
                  agility. RosterXPro transforms workforce management from a
                  reactive task into a strategic advantage—driving productivity,
                  reducing overhead, and aligning talent with business
                  objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get with RosterXPro */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-8 md:py-12">
            <div
              className={`mx-auto max-w-3xl pb-4 text-center md:pb-12 animate-on-scroll ${
                visibleElements.has("core-benefits-header") ? "visible" : ""
              }`}
              data-animate-id="core-benefits-header"
            >
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Core Benefits
                </span>
              </div>
              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                What you get with RosterXPro
              </h2>
              <p className="text-lg text-indigo-200/65">
                Everything you need to manage your workforce efficiently and
                effectively
              </p>
            </div>

            <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
              {[
                {
                  icon: <Calendar className="w-6 h-6" />,
                  title: "Intelligent Roster Generation",
                  description:
                    "Automated monthly roster creation with smart conflict resolution and shift optimization",
                },
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: "Advanced Leave Management",
                  description:
                    "Comprehensive leave tracking with comp-off balance management and automated workflows",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Multi-Project Coordination",
                  description:
                    "Seamless coordination across multiple projects and teams with real-time synchronization",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Enterprise Security",
                  description:
                    "Role-based access control with advanced data protection and compliance management",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Real-time Updates",
                  description:
                    "Instant notifications for roster changes, leave approvals, and critical updates",
                },
                {
                  icon: <BarChart3 className="w-6 h-6" />,
                  title: "Analytics & Insights",
                  description:
                    "Comprehensive reporting on shift efficiency, leave patterns, and workforce utilization",
                },
              ].map((feature, index) => (
                <article key={index}>
                  <div className="mb-3 fill-indigo-500 text-indigo-500">
                    {feature.icon}
                  </div>
                  <h3 className="mb-1 font-nacelle text-[1rem] font-semibold text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-indigo-200/65">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Journey */}
      <section id="journey">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 md:pb-20">
            <div
              className={`mx-auto max-w-3xl pb-12 text-center md:pb-20 animate-on-scroll ${
                visibleElements.has("journey-header") ? "visible" : ""
              }`}
              data-animate-id="journey-header"
            >
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Tailored Workflows
                </span>
              </div>
              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Map your product journey
              </h2>
              <p className="text-lg text-indigo-200/65">
                Simple and elegant interface to start collaborating with your
                team in minutes. It seamlessly integrates with your code and
                your favorite programming languages.
              </p>
            </div>

            <div className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  title: "Built-in Tools",
                  image: "/dashboard/workflow-01.png",
                  description:
                    "Comprehensive roster management tools with intelligent scheduling algorithms, leave tracking, and team coordination features built directly into the platform.",
                },
                {
                  title: "Scale Instantly",
                  image: "/dashboard/workflow-02.png",
                  description:
                    "Easily scale your workforce management from small teams to enterprise organizations with automated processes and advanced analytics.",
                },
                {
                  title: "Tailored Flows",
                  image: "/dashboard/workflow-03.png",
                  description:
                    "Customize workflows and rules to match your organization's specific needs, from shift patterns to leave policies and approval processes.",
                },
              ].map((journey, index) => (
                <div
                  key={index}
                  className={`group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100 animate-on-scroll-scale ${
                    visibleElements.has(`journey-card-${index}`)
                      ? "visible"
                      : ""
                  }`}
                  data-animate-id={`journey-card-${index}`}
                  style={{ transitionDelay: `${index * 0.2}s` }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                  }}
                >
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-linear-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                    <div className="p-6">
                      <div className="mb-6 flex justify-center">
                        <img
                          src={journey.image}
                          alt={journey.title}
                          className="h-52 w-full object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">
                        {journey.title}
                      </h3>
                      <p className="text-indigo-200/65">
                        {journey.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get your Roster up and running */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Title and Steps */}
              <div
                className={`space-y-8 animate-on-scroll-left ${
                  visibleElements.has("roster-setup-left") ? "visible" : ""
                }`}
                data-animate-id="roster-setup-left"
              >
                <div>
                  <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                    <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                      Quick Setup
                    </span>
                  </div>
                  <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                    Get your Roster up and running in no time with RosterXPro
                  </h2>
                  <p className="text-lg text-indigo-200/65">
                    Experience the power of intelligent workforce management
                    with our streamlined setup process
                  </p>
                </div>

                {/* Steps in Vertical Format */}
                <div className="space-y-6">
                  {[
                    {
                      step: "Step 1",
                      title: "Register",
                      description:
                        "Create your account and set up your organization profile",
                    },
                    {
                      step: "Step 2",
                      title: "Create Team",
                      description:
                        "Set up your team structure and define roles",
                    },
                    {
                      step: "Step 3",
                      title: "Add Members",
                      description:
                        "Invite team members and configure their profiles",
                    },
                    {
                      step: "Step 4",
                      title: "Set Rules",
                      description: "Define scheduling rules and leave policies",
                    },
                    {
                      step: "Step 5",
                      title: "Generate Roster",
                      description:
                        "Let AI create your optimized monthly roster",
                    },
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-200 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-indigo-200/65 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ready Badge */}
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Ready!</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div
                className={`flex justify-center lg:justify-end animate-on-scroll-right ${
                  visibleElements.has("roster-setup-right") ? "visible" : ""
                }`}
                data-animate-id="roster-setup-right"
              >
                <img
                  src="/dashboard/watch.avif"
                  alt="Roster Setup"
                  className="max-w-md w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Meets Functionality */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div
              className={`mx-auto max-w-3xl pb-4 text-center md:pb-12 animate-on-scroll ${
                visibleElements.has("fun-functionality-header") ? "visible" : ""
              }`}
              data-animate-id="fun-functionality-header"
            >
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  User Experience
                </span>
              </div>
              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Fun Meets Functionality!
              </h2>
              <p className="text-lg text-indigo-200/65">
                Enjoy a delightful user experience while getting powerful
                workforce management capabilities
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  {[
                    {
                      icon: <Sparkles className="w-6 h-6" />,
                      title: "Intuitive Interface",
                      description:
                        "Beautiful, modern design that makes workforce management enjoyable and efficient",
                    },
                    {
                      icon: <Zap className="w-6 h-6" />,
                      title: "Lightning Fast",
                      description:
                        "Instant updates and real-time synchronization across all devices and team members",
                    },
                    {
                      icon: <Award className="w-6 h-6" />,
                      title: "Award-Winning UX",
                      description:
                        "Consistently recognized for exceptional user experience and design excellence",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-4 animate-on-scroll-slide-up ${
                        visibleElements.has(`fun-feature-${index}`)
                          ? "visible"
                          : ""
                      }`}
                      data-animate-id={`fun-feature-${index}`}
                      style={{ transitionDelay: `${index * 0.15}s` }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Experience the Difference
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Join thousands of teams already enjoying the perfect blend
                    of fun and functionality.
                  </p>
                  <Button
                    onClick={() => setShowRegistrationModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    Try It Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for modern teams with Automation-driven tools */}
      <section id="features" className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div className="mx-auto max-w-3xl pb-4 text-center md:pb-12">
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Team Focused & Automation
                </span>
              </div>
              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Built for modern teams with automation-driven tools
              </h2>

              <p className="text-lg text-indigo-200/65">
                Designed with the needs of modern teams in mind, featuring
                intuitive interfaces, powerful automation, and seamless
                collaboration tools that streamline your workforce management
                processes.
              </p>
            </div>
            {/* Modern Team Image */}
            <div className="mb-0">
              <div
                className="flex justify-center pb-2 md:pb-12"
                data-aos="fade-up"
              >
                <img
                  src="/dashboard/modern-team.png"
                  alt="Modern Team"
                  className="max-w-none rounded-2xl shadow-4xl"
                  width={1104}
                  height={384}
                />
              </div>
            </div>

            {/* Automation Tools Grid */}
            <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
              {[
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Smart Scheduling",
                  description:
                    "AI-powered roster generation that learns from your team's patterns and preferences",
                },
                {
                  icon: <BarChart3 className="w-6 h-6" />,
                  title: "Predictive Analytics",
                  description:
                    "Advanced analytics to forecast workforce needs and optimize team performance",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Auto-Notifications",
                  description:
                    "Automated alerts and notifications for roster changes and important updates",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Compliance Automation",
                  description:
                    "Automatic compliance checks and audit trails for regulatory requirements",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Team Sync",
                  description:
                    "Real-time synchronization across all team members and devices",
                },
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: "Time Optimization",
                  description:
                    "Intelligent time tracking and leave management with automated workflows",
                },
              ].map((feature, index) => (
                <article key={index}>
                  <div className="mb-3 fill-indigo-500 text-indigo-500">
                    {feature.icon}
                  </div>
                  <h3 className="mb-1 font-nacelle text-[1rem] font-semibold text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-indigo-200/65">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div
              className={`mx-auto max-w-3xl pb-4 text-center md:pb-12 animate-on-scroll ${
                visibleElements.has("pricing-header") ? "visible" : ""
              }`}
              data-animate-id="pricing-header"
            >
              <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
                <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                  Pricing Plans
                </span>
              </div>
              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,white,#93c5fd,white,#3b82f6,white)] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-indigo-200/65">
                Start free today, upgrade when you need advanced features
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div
                className={`p-8 rounded-2xl bg-slate-900/50 border border-slate-800 animate-on-scroll-slide-up ${
                  visibleElements.has("pricing-free") ? "visible" : ""
                }`}
                data-animate-id="pricing-free"
              >
                <div className="text-center mb-8">
                  <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30 mb-4">
                    Current
                  </span>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Free Plan
                  </h3>
                  <div className="text-5xl font-bold text-white mb-2">
                    ₹0<span className="text-lg text-slate-400">/month</span>
                  </div>
                  <p className="text-slate-400">
                    Perfect for getting started and small teams
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited team members",
                    "Basic roster generation",
                    "Leave management",
                    "Comp-off tracking",
                    "Email support",
                    "Basic analytics",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setShowRegistrationModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Start Free
                </Button>
              </div>

              <div
                className={`p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden animate-on-scroll-slide-up ${
                  visibleElements.has("pricing-pro") ? "visible" : ""
                }`}
                data-animate-id="pricing-pro"
                style={{ transitionDelay: "0.2s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-300 text-sm font-medium rounded-full border border-orange-500/30 mb-4">
                      Pro
                    </span>
                    <h3 className="text-2xl font-semibold mb-4">Pro Plan</h3>
                    <div className="text-5xl font-bold mb-2">
                      ₹500<span className="text-lg opacity-75">/month</span>
                    </div>
                    <p className="opacity-90">
                      Advanced features for growing organizations
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Free",
                      "Employee database",
                      "Advanced analytics",
                      "Internal job portal",
                      "Employee forum",
                      "Priority support",
                      "No advertisements",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="opacity-90">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>

            {/* Currency Conversion */}
            <div
              className={`mt-16 text-center animate-on-scroll-fade ${
                visibleElements.has("currency-conversion") ? "visible" : ""
              }`}
              data-animate-id="currency-conversion"
            >
              <p className="text-slate-300 mb-6 text-lg">
                Pro Plan Pricing in Different Currencies:
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { amount: "₹500", currency: "INR" },
                  { amount: "$6", currency: "USD" },
                  { amount: "£5", currency: "GBP" },
                  { amount: "€6", currency: "EUR" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`px-6 py-3 bg-slate-900/50 rounded-xl border border-slate-800 animate-on-scroll-bounce ${
                      visibleElements.has(`currency-${index}`) ? "visible" : ""
                    }`}
                    data-animate-id={`currency-${index}`}
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <span className="font-bold text-white">{item.amount}</span>
                    <span className="text-slate-400 ml-2">
                      ({item.currency})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimers & Security Compliance */}
      <section className="relative bg-slate-900/50 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-16">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Disclaimers */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <span className="text-red-400 mr-2">*</span>
                  Beta Program Disclaimers
                </h3>
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <span className="text-red-400 font-medium">
                      Beta Access Notice:
                    </span>{" "}
                    Not all features are currently available. Beta users will
                    receive priority access to Pro features as they become
                    available.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <span className="text-red-400 font-medium">
                      Service Interruptions:
                    </span>{" "}
                    Users may experience temporary slowness or disruptions
                    during maintenance windows as we continuously improve the
                    platform.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <span className="text-red-400 font-medium">
                      Feature Evolution:
                    </span>{" "}
                    Features may be modified, removed, or enhanced during the
                    Beta phase based on user feedback and technical
                    requirements.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    <span className="text-red-400 font-medium">
                      Data Management:
                    </span>{" "}
                    In the event of unforeseen circumstances, user data may be
                    deleted as part of our data protection protocols.
                  </p>
                </div>
              </div>

              {/* Security Compliance */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 text-green-400 mr-2" />
                  Enterprise Security & Compliance
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Our infrastructure provider maintains the highest security
                  standards with comprehensive compliance certifications
                  ensuring your data protection and privacy.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "SOC 2 Type 2 Compliance",
                    "HIPAA Compliance",
                    "ISO 27001",
                    "EU-U.S. Data Privacy Framework",
                    "PCI DSS v4.0",
                    "SAQ-D Attestation",
                    "SAQ-A Attestation",
                    "Vulnerability Scanning",
                    "Penetration Testing",
                    "Regular Security Audits",
                    "GDPR Compliance",
                  ].map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300 text-xs">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* {/* Footer 
      <footer className="py-16 border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div
              className={`animate-on-scroll-slide-up ${
                visibleElements.has("footer-brand") ? "visible" : ""
              }`}
              data-animate-id="footer-brand"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RosterXPro</span>
              </div>
              <p className="text-slate-400">
                Empowering businesses through innovative workforce management
                solutions.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { name: "Features", href: "#features" },
                  { name: "Journey", href: "#journey" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "Security", href: "#" },
                ],
              },
              {
                title: "Company",
                links: [
                  { name: "About", href: "#" },
                  { name: "Blog", href: "#" },
                  { name: "Careers", href: "#" },
                  { name: "Contact", href: "#contact" },
                ],
              },
              {
                title: "Support",
                links: [
                  { name: "Documentation", href: "#" },
                  { name: "Help Center", href: "#" },
                  { name: "API Reference", href: "#" },
                  { name: "Status", href: "#" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-6">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">
              © 2025 RosterXPro. All rights reserved. Made with ❤️ for
              enterprise teams.
            </p>
          </div>
        </div>
      </footer> */}

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => setShowRegistrationModal(true)}
        onSwitchToForgotPassword={() => setActiveModal("forgot")}
      />

      <Dialog
        open={activeModal === "forgot"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Reset Your Password
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your email address and we'll send you a link to reset your
              password
            </DialogDescription>
          </DialogHeader>
          <ForgotPasswordForm />
        </DialogContent>
      </Dialog>

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSwitchToLogin={() => setShowLoginModal(true)}
      />
    </div>
  );
};

export default LandingPage;
