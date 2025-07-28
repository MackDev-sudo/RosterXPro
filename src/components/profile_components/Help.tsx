import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Calendar,
  Users,
  Clock,
  Shield,
  Zap,
  FileText,
  Settings,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  MessageCircle,
  Headphones,
} from "lucide-react";

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC<HelpProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      title: "Roster Management",
      description:
        "Create, edit, and manage team schedules with automated conflict resolution",
      details: [
        "Monthly roster generation with intelligent scheduling",
        "Shift assignment (Morning, Evening, Night, On-Call)",
        "Conflict detection and resolution",
        "Real-time roster updates and synchronization",
      ],
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Team Management",
      description: "Manage team members, roles, and organizational structure",
      details: [
        "Add and remove team members",
        "Role-based access control (Admin/Member)",
        "Team creation and management",
        "User profile management",
      ],
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: "Leave Management",
      description: "Comprehensive leave tracking and approval system",
      details: [
        "Apply for various leave types (PL, SL, EL, CmO)",
        "Leave request approval workflow",
        "Upcoming leave tracking",
        "Applied leave history",
      ],
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: "Comp-off System",
      description: "Advanced comp-off balance tracking and carry forward",
      details: [
        "Comp-off balance calculation (OC - CF)",
        "Monthly carry forward system",
        "Balance validation and restrictions",
        "Real-time balance updates",
      ],
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Real-time Updates",
      description: "Instant synchronization and live data updates",
      details: [
        "Live roster changes",
        "Instant balance updates",
        "Real-time notifications",
        "Multi-user collaboration",
      ],
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      title: "Reports & Analytics",
      description: "Comprehensive reporting and workforce insights",
      details: [
        "Leave analytics and trends",
        "Team utilization reports",
        "Comp-off usage statistics",
        "Export capabilities",
      ],
    },
  ];

  const faqs: FAQItem[] = [
    // Roster Management FAQs
    {
      question: "How do I create a new roster for a month?",
      answer:
        "Navigate to the desired month using the navigation arrows. If no roster exists, you can manually assign shifts or use the 'Generate Roster' feature to automatically create a roster based on your team's availability and rules.",
      category: "roster",
    },
    {
      question: "Can I edit roster entries after they're created?",
      answer:
        "Yes, you can edit roster entries for the current month and next month. Past months are read-only for historical reference. Simply click on any cell in the roster table to change the shift assignment.",
      category: "roster",
    },
    {
      question: "What are the different shift types available?",
      answer:
        "Available shifts include: S1 (Sunrise Shift: 6:00 AM - 2:00 PM), S2 (Midday Shift: 2:00 PM - 11:00 PM), S3 (Moonlight Shift: 10:00 PM - 7:00 AM), HS (Swing Shift: 6:00 PM - 3:00 PM), OC (On-Call), and various leave types (PL, SL, EL, CmO).",
      category: "roster",
    },
    {
      question: "How does the comp-off system work?",
      answer:
        "The comp-off system tracks On-Call (OC) days earned and Comp-off (CF) days used. Your balance is calculated as: Previous Month Carry Forward + Current Month OC - Current Month CF. Unused comp-offs automatically carry forward to the next month.",
      category: "comp-off",
    },
    {
      question: "Why can't I apply for comp-off (CF)?",
      answer:
        "You can only apply for comp-off if your balance is greater than 0. The system prevents applying CF when your balance is 0 or negative. Check your comp-off balance card to see your available balance.",
      category: "comp-off",
    },
    {
      question: "How do I apply for leave?",
      answer:
        "Use the 'Add Leave' button to submit leave requests. You can apply for Planned Leave (PL), Sick Leave (SL), Emergency Leave (EL), or Comp-off (CmO). Leave requests will be tracked in the Leave Tracker section.",
      category: "leave",
    },
    {
      question: "What's the difference between upcoming and applied leaves?",
      answer:
        "Upcoming leaves are future leave requests that have been submitted but not yet taken. Applied leaves are leaves that have already been taken and recorded in the roster. Both are tracked separately for better management.",
      category: "leave",
    },
    {
      question: "How do I add new team members?",
      answer:
        "Team admins can add new members using the 'Add Member' button. You'll need to provide the member's email address. The new member will receive an invitation to join the team and set up their profile.",
      category: "team",
    },
    {
      question: "What are the different user roles?",
      answer:
        "There are two main roles: Admin (can manage team, view all data, add members) and Member (can view own data, apply for leaves, update own roster entries). Role permissions are managed by team admins.",
      category: "team",
    },
    {
      question: "How do I navigate between months?",
      answer:
        "Use the left and right arrow buttons next to the month/year display. You can navigate to the current month, next month, and view previous months (read-only). Navigation beyond the next month is restricted.",
      category: "navigation",
    },
    {
      question: "Why can't I modify past month rosters?",
      answer:
        "Past month rosters are read-only to maintain data integrity and prevent historical changes. This ensures accurate reporting and audit trails. You can view past data but cannot modify it.",
      category: "navigation",
    },
    {
      question: "How do I save my roster changes?",
      answer:
        "Roster changes are automatically saved as you make them. You'll see a 'Save' button that becomes active when there are unsaved changes. Click it to confirm and persist your changes to the database.",
      category: "roster",
    },
  ];

  const troubleshooting = [
    {
      issue: "Comp-off balance showing 0",
      solution:
        "Check if you have any On-Call (OC) assignments in the current month. The balance is calculated as OC days minus CF days. If you're viewing a new month, check if carry forward is working correctly.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    {
      issue: "Can't apply for comp-off",
      solution:
        "Ensure your comp-off balance is greater than 0. You cannot apply CF when your balance is 0 or negative. Check the comp-off balance card for your current available balance.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    {
      issue: "Roster changes not saving",
      solution:
        "Make sure you're connected to the internet. Click the 'Save' button to persist changes. If issues persist, refresh the page and try again. Check browser console for any error messages.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    {
      issue: "Leave count not updating",
      solution:
        "Refresh the page to reload data from the server. Check if you're viewing the correct month. Leave counts are calculated based on the current month's roster entries.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    {
      issue: "Team members not showing",
      solution:
        "Ensure you have the correct team selected. Check if team members have been properly added and have active accounts. Contact your team admin if you're missing from the roster.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
    {
      issue: "Navigation not working",
      solution:
        "You can only navigate to the current month, next month, and view previous months. Navigation beyond the next month is restricted. Use the arrow buttons to navigate between allowed months.",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
    },
  ];

  const contactInfo = [
    {
      type: "Email Support",
      value: "support@mackdev.com",
      icon: <Mail className="h-4 w-4" />,
      description: "For technical issues and general inquiries",
    },
    {
      type: "Phone Support",
      value: "1800-100-100-9900",
      icon: <Phone className="h-4 w-4" />,
      description: "24/7 customer support hotline",
    },
  ];

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(expandedFAQ === question ? null : question);
  };

  const getFilteredFAQs = (category: string) => {
    return faqs.filter((faq) => faq.category === category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            Help & Support Center
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              {
                id: "overview",
                label: "Overview",
                icon: <BookOpen className="h-4 w-4" />,
              },
              {
                id: "features",
                label: "Features",
                icon: <Settings className="h-4 w-4" />,
              },
              {
                id: "faq",
                label: "FAQ",
                icon: <HelpCircle className="h-4 w-4" />,
              },
              {
                id: "troubleshooting",
                label: "Troubleshooting",
                icon: <AlertTriangle className="h-4 w-4" />,
              },
              {
                id: "contact",
                label: "Contact",
                icon: <MessageCircle className="h-4 w-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Welcome to RosterXPro
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  RosterXPro is an enterprise-grade workforce management
                  solution designed to streamline roster creation, leave
                  management, and team coordination. Our intelligent system
                  automates scheduling, tracks comp-offs, and provides
                  comprehensive reporting for modern organizations.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• 90% reduction in scheduling time</li>
                    <li>• 80% fewer scheduling conflicts</li>
                    <li>• Improved employee satisfaction</li>
                    <li>• Real-time collaboration</li>
                    <li>• Comprehensive audit trails</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-purple-600" />
                    Quick Start
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Select your team from the dropdown</li>
                    <li>• Navigate to the desired month</li>
                    <li>• Click on roster cells to assign shifts</li>
                    <li>• Use the 'Add Leave' button for leave requests</li>
                    <li>• Check your comp-off balance regularly</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {feature.description}
                        </p>
                        <ul className="space-y-1">
                          {feature.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              {[
                {
                  id: "roster",
                  title: "Roster Management",
                  icon: <Calendar className="h-4 w-4" />,
                },
                {
                  id: "comp-off",
                  title: "Comp-off System",
                  icon: <Shield className="h-4 w-4" />,
                },
                {
                  id: "leave",
                  title: "Leave Management",
                  icon: <Clock className="h-4 w-4" />,
                },
                {
                  id: "team",
                  title: "Team Management",
                  icon: <Users className="h-4 w-4" />,
                },
                {
                  id: "navigation",
                  title: "Navigation & Usage",
                  icon: <Settings className="h-4 w-4" />,
                },
              ].map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredFAQs(category.id).map((faq, index) => (
                      <div key={index} className="p-4">
                        <button
                          onClick={() => toggleFAQ(faq.question)}
                          className="w-full text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {faq.question}
                          </span>
                          {expandedFAQ === faq.question ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        {expandedFAQ === faq.question && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === "troubleshooting" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Common Issues & Solutions
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  If you're experiencing issues, try these solutions before
                  contacting support.
                </p>
              </div>

              <div className="grid gap-4">
                {troubleshooting.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      {item.icon}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.issue}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Still Need Help?
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  If these solutions don't resolve your issue, please contact
                  our support team.
                </p>
                <Button
                  onClick={() => setActiveTab("contact")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Get in Touch
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our dedicated support team is here to help you with any
                  questions, technical issues, or feature requests. We're
                  committed to providing excellent customer service and ensuring
                  your success with RosterXPro.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {contactInfo.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        {contact.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {contact.type}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono text-blue-600 dark:text-blue-400">
                          {contact.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            if (contact.type === "Email Support") {
                              window.open(`mailto:${contact.value}`, "_blank");
                            } else if (contact.type === "Phone Support") {
                              window.open(`tel:${contact.value}`, "_blank");
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Support Hours
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Phone Support
                    </p>
                    <p>24/7 Available</p>
                    <p>Emergency issues and urgent requests</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Email Support
                    </p>
                    <p>Response within 4 hours</p>
                    <p>General inquiries and feature requests</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Help;
