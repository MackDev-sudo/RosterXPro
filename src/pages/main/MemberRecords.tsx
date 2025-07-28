import React, { useState } from "react";
import {
  Calendar,
  Building2,
  Briefcase,
  Award,
  FileText,
  Target,
  Edit,
  Download,
  Eye,
  Star,
  Clock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddMemberRecords } from "@/components/main/AddMemberRecords";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const MemberRecords: React.FC = () => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [hasData, setHasData] = useState(false); // This will be controlled by backend data

  // Mock data - will be replaced with actual backend data
  const mockData = {
    dateOfJoiningOrg: "2023-01-15",
    dateOfJoiningProject: "2023-02-01",
    previousProjects: [
      {
        name: "E-commerce Platform",
        organization: "TechCorp Inc.",
        duration: "2022-2023",
        role: "Senior Developer",
      },
      {
        name: "Healthcare Management System",
        organization: "HealthTech Solutions",
        duration: "2021-2022",
        role: "Full Stack Developer",
      },
    ],
    previousOrganizations: [
      {
        name: "TechCorp Inc.",
        position: "Senior Developer",
        duration: "2022-2023",
      },
      {
        name: "HealthTech Solutions",
        position: "Full Stack Developer",
        duration: "2021-2022",
      },
    ],
    skills: [
      { name: "React", experience: "3 years", level: "Advanced" as const },
      { name: "Node.js", experience: "2.5 years", level: "Advanced" as const },
      { name: "Python", experience: "2 years", level: "Intermediate" as const },
      { name: "AWS", experience: "1.5 years", level: "Intermediate" as const },
      { name: "Docker", experience: "1 year", level: "Intermediate" as const },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023-06-15",
        file: null,
        fileName: "aws-cert.pdf",
      },
      {
        name: "React Developer Certification",
        issuer: "Meta",
        date: "2022-12-10",
        file: null,
        fileName: "react-cert.pdf",
      },
    ],
    achievements: [
      {
        title: "Employee of the Year",
        description: "Recognized for outstanding performance and innovation",
        date: "2023-12-01",
        category: "Performance",
      },
      {
        title: "Best Project Delivery",
        description: "Successfully delivered project 2 weeks ahead of schedule",
        date: "2023-08-15",
        category: "Project Management",
      },
    ],
    aspirations: [
      "Lead a team of 10+ developers",
      "Become a Technical Architect",
      "Contribute to open-source projects",
      "Mentor junior developers",
      "Learn cloud-native technologies",
    ],
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Advanced":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Intermediate":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Beginner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Performance":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Project Management":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Innovation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Member Records
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your professional profile and career information
              </p>
            </div>
            <Button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              {hasData ? "Update Details" : "Add Details"}
            </Button>
          </div>

          {!hasData ? (
            /* Empty State */
            <Card className="text-center py-12">
              <CardContent>
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Member Records Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Complete your professional profile to showcase your
                  experience, skills, and achievements.
                </p>
                <Button
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Add Your Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Member Records Content */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Joining Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Joining Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Organization
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date of Joining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(
                            mockData.dateOfJoiningOrg
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Current Project
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date of Joining
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(
                            mockData.dateOfJoiningProject
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Previous Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.previousProjects.map((project, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {project.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {project.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {project.organization}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Role: {project.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Previous Organizations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Previous Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.previousOrganizations.map((org, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {org.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {org.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Position: {org.position}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Skills & Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {skill.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {skill.experience}
                            </p>
                          </div>
                          <Badge className={getLevelColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {cert.name}
                            </h4>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Issued by: {cert.issuer}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Date: {new Date(cert.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockData.achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {achievement.title}
                            </h4>
                            <Badge
                              className={getCategoryColor(achievement.category)}
                            >
                              {achievement.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Aspirations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Career Aspirations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockData.aspirations.map((aspiration, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                          <p className="text-gray-900 dark:text-white">
                            {aspiration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Member Records Modal */}
      <AddMemberRecords
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSave={(data) => {
          console.log("Saving member records:", data);
          setHasData(true);
          setShowAddMemberModal(false);
        }}
        initialData={hasData ? mockData : undefined}
      />

      <Footer />
    </div>
  );
};

export default MemberRecords;
