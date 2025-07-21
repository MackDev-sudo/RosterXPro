import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import RegistrationModal from './auth/RegistrationPage';
import LoginModal from './auth/LoginPage';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'forgot' | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const features = [
    {
      icon: <Calendar className="w-12 h-12 text-blue-600" />,
      title: "Automated Scheduling",
      description: "Generate optimal rosters for entire months with intelligent conflict resolution"
    },
    {
      icon: <Clock className="w-12 h-12 text-green-600" />,
      title: "Leave Management",
      description: "Track leaves, comp-offs, and time-off requests with automated approval workflows"
    },
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: "Team Coordination",
      description: "Seamless coordination between departments with real-time updates and notifications"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-orange-600" />,
      title: "Analytics & Reports",
      description: "Comprehensive insights into workforce utilization and scheduling efficiency"
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: "Compliance Management",
      description: "Ensure labor law compliance with automated checks and alerts"
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-600" />,
      title: "Real-time Updates",
      description: "Instant notifications for schedule changes, approvals, and important updates"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Solutions",
      rating: 5,
      comment: "RosterPro has transformed our scheduling process. What used to take days now takes minutes!"
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      company: "Global Manufacturing",
      rating: 5,
      comment: "The automated leave management feature alone has saved us countless hours of administrative work."
    },
    {
      name: "Emma Davis",
      role: "Team Lead",
      company: "Healthcare Plus",
      rating: 5,
      comment: "Finally, a rostering system that actually understands the complexity of shift work. Highly recommended!"
    }
  ];

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
      <Button
        type="submit"
        className="w-full"
      >
        Send Reset Link
      </Button>
      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RosterXPro</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowRegistrationModal(true)}
              >
                Get Started
              </Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Features</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Pricing</a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Contact</a>
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="w-full justify-start"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowRegistrationModal(true)}
                className="w-full justify-start text-blue-600"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Revolutionize Your
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> 
                Workforce Scheduling
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-gray-100">
              Automate roster generation, track leaves and comp-offs, and streamline your entire workforce management process with our intelligent enterprise solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Powerful Features for Modern Enterprises
            </h2>
            <p className="section-subtitle">
              Everything you need to manage your workforce efficiently and effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <CardTitle className="text-xl font-semibold text-gray-800 mb-3 text-center">{feature.title}</CardTitle>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Why Choose RosterPro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Save 90% of Scheduling Time</h3>
                    <p className="text-gray-600">Automated roster generation reduces manual work from days to minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Reduce Conflicts by 80%</h3>
                    <p className="text-gray-600">Intelligent conflict detection and resolution prevents scheduling issues</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Improve Employee Satisfaction</h3>
                    <p className="text-gray-600">Fair scheduling algorithms and easy leave management boost morale</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Ensure Compliance</h3>
                    <p className="text-gray-600">Automated compliance checks with labor laws and regulations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Employees Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-gray-600">Companies Trust Us</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-gray-600">Uptime Guarantee</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who trust RosterPro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your organization's needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Starter</h3>
              <div className="text-3xl font-bold text-gray-800 mb-4">$29<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Up to 50 employees</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Basic roster generation</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Leave management</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Email support</li>
              </ul>
              <Button variant="secondary" className="w-full">
                Get Started
              </Button>
            </div>
            
            <div className="bg-blue-600 text-white rounded-lg p-8 relative hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-4">Professional</h3>
              <div className="text-3xl font-bold mb-4">$79<span className="text-lg opacity-75">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-400 mr-2" />Up to 200 employees</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-400 mr-2" />Advanced scheduling</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-400 mr-2" />Analytics & reports</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-400 mr-2" />API integration</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-400 mr-2" />Priority support</li>
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                Get Started
              </Button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Enterprise</h3>
              <div className="text-3xl font-bold text-gray-800 mb-4">$199<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Unlimited employees</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Custom integrations</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />Dedicated support</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />SLA guarantee</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" />On-premise deployment</li>
              </ul>
              <Button variant="secondary" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Contact us today to see how RosterPro can transform your workforce management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-600">sales@rosterpro.com</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-gray-600">123 Business Ave, Suite 100<br />San Francisco, CA 94102</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input
                    id="contact-company"
                    type="text"
                    placeholder="Your company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-1 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">RosterPro</span>
              </div>
              <p className="text-gray-400">
                Transforming workforce management with intelligent scheduling solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RosterPro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => setShowRegistrationModal(true)}
        onSwitchToForgotPassword={() => setActiveModal('forgot')}
      />

      <Dialog open={activeModal === 'forgot'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password
            </DialogDescription>
          </DialogHeader>
          <ForgotPasswordForm />
        </DialogContent>
      </Dialog>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSwitchToLogin={() => setShowLoginModal(true)}
      />
    </div>
  );
};

export default LandingPage;