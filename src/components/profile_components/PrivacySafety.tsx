import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Lock,
  Database,
  Eye,
  Users,
  CheckCircle,
  Server,
  Key,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface PrivacySafetyProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacySafety: React.FC<PrivacySafetyProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Shield className="h-6 w-6 text-blue-600" />
            Privacy & Safety
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2 space-y-6">
          {/* Data Collection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Collection
              </h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We collect essential organizational data required for enterprise
                rostering operations. This encompasses user profiles, team
                structures, roster entries, and leave management data necessary
                for comprehensive workforce planning and team coordination.
              </p>
            </div>
          </div>

          <Separator />

          {/* Data Protection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Protection
              </h3>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>We do not share your data for any purpose.</strong>{" "}
                  Your organization's data remains private and is used solely
                  for rostering and team management functionalities.
                </p>
              </div>
            </div>

            {/* Data Deletion Section */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Data Deletion Rights:</strong> Users have complete
                  control over their data. All user data can be deleted at any
                  time upon request, and we will not store or retain the data in
                  any form after deletion. Your data sovereignty is our
                  priority.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Technology Stack Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Technology & Security
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Best Technologies */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Best Technologies
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built on strong foundations with modern, secure technologies
                  for enterprise-grade reliability and performance. Our robust
                  architecture ensures scalability and maintainability.
                </p>
              </div>

              {/* Encryption */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Encryption
                  </h4>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      In Transit
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      TLS encryption
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      At Rest
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      AES-256 encryption
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Access Control Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Access Control
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* RBAC */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Role-Based Access Control (RBAC)
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Granular permissions based on user roles (Admin, Member)
                  ensuring users only access data they're authorized to view.
                  Comprehensive access control mechanisms prevent unauthorized
                  data exposure.
                </p>
              </div>

              {/* RLS */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Row-Level Security (RLS)
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Database-level security policies that automatically filter
                  data based on user context and team membership. Advanced data
                  isolation ensures complete separation between organizational
                  units.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Compliance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compliance & Standards
              </h3>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Our infrastructure provider maintains the highest security
                standards:
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">
                    SOC 2 Type 2 Compliance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">HIPAA Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">
                    EU-U.S. Data Privacy Framework
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">PCI DSS v4.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">SAQ-D Attestation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">SAQ-A Attestation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">
                    Vulnerability Scanning
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">
                    Penetration Testing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">
                    Regular Security Audits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium">GDPR Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              For privacy concerns, data deletion requests, or questions
              regarding our security practices, please contact your
              organization's administrator or reach out to our dedicated support
              team.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacySafety;
