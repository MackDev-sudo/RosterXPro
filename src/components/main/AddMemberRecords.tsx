import React, { useState, useEffect } from "react";
import {
  Calendar,
  Building2,
  Briefcase,
  Award,
  FileText,
  Target,
  Plus,
  X,
  Upload,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Skill {
  name: string;
  experience: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  file: File | null;
  fileName: string;
}

interface Project {
  name: string;
  organization: string;
  duration: string;
  role: string;
}

interface Organization {
  name: string;
  position: string;
  duration: string;
}

interface Achievement {
  title: string;
  description: string;
  date: string;
  category: string;
}

interface MemberRecordsData {
  dateOfJoiningOrg: string;
  dateOfJoiningProject: string;
  previousProjects: Project[];
  previousOrganizations: Organization[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  aspirations: string[];
}

interface AddMemberRecordsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MemberRecordsData) => void;
  initialData?: MemberRecordsData;
}

export const AddMemberRecords: React.FC<AddMemberRecordsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<MemberRecordsData>({
    dateOfJoiningOrg: "",
    dateOfJoiningProject: "",
    previousProjects: [],
    previousOrganizations: [],
    skills: [],
    certifications: [],
    achievements: [],
    aspirations: [],
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    experience: "",
    level: "Intermediate" as const,
  });
  const [newProject, setNewProject] = useState({
    name: "",
    organization: "",
    duration: "",
    role: "",
  });
  const [newOrganization, setNewOrganization] = useState({
    name: "",
    position: "",
    duration: "",
  });
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
  });
  const [newAspiration, setNewAspiration] = useState("");
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof MemberRecordsData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.name && newSkill.experience) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }],
      }));
      setNewSkill({ name: "", experience: "", level: "Intermediate" });
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    if (newProject.name && newProject.organization) {
      setFormData((prev) => ({
        ...prev,
        previousProjects: [...prev.previousProjects, { ...newProject }],
      }));
      setNewProject({ name: "", organization: "", duration: "", role: "" });
    }
  };

  const removeProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      previousProjects: prev.previousProjects.filter((_, i) => i !== index),
    }));
  };

  const addOrganization = () => {
    if (newOrganization.name && newOrganization.position) {
      setFormData((prev) => ({
        ...prev,
        previousOrganizations: [
          ...prev.previousOrganizations,
          { ...newOrganization },
        ],
      }));
      setNewOrganization({ name: "", position: "", duration: "" });
    }
  };

  const removeOrganization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      previousOrganizations: prev.previousOrganizations.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const addAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, { ...newAchievement }],
      }));
      setNewAchievement({ title: "", description: "", date: "", category: "" });
    }
  };

  const removeAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const addAspiration = () => {
    if (newAspiration.trim()) {
      setFormData((prev) => ({
        ...prev,
        aspirations: [...prev.aspirations, newAspiration.trim()],
      }));
      setNewAspiration("");
    }
  };

  const removeAspiration = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aspirations: prev.aspirations.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (
      newCertification.name &&
      newCertification.issuer &&
      newCertification.file
    ) {
      const certification: Certification = {
        name: newCertification.name,
        issuer: newCertification.issuer,
        date: newCertification.date,
        file: newCertification.file,
        fileName: newCertification.file.name,
      };
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certification],
      }));
      setNewCertification({ name: "", issuer: "", date: "", file: null });
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (allowedTypes.includes(file.type)) {
        setNewCertification((prev) => ({ ...prev, file }));
      } else {
        alert("Please select only JPG, PNG, or PDF files.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? "Update Member Records" : "Add Member Records"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Joining Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="dateOfJoiningOrg"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date of Joining Organization
              </Label>
              <Input
                id="dateOfJoiningOrg"
                type="date"
                value={formData.dateOfJoiningOrg}
                onChange={(e) =>
                  handleInputChange("dateOfJoiningOrg", e.target.value)
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="dateOfJoiningProject"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date of Joining Project
              </Label>
              <Input
                id="dateOfJoiningProject"
                type="date"
                value={formData.dateOfJoiningProject}
                onChange={(e) =>
                  handleInputChange("dateOfJoiningProject", e.target.value)
                }
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Skills & Experience
            </h3>

            {/* Add New Skill */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Experience (e.g., 3 years)"
                value={newSkill.experience}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
              />
              <Select
                value={newSkill.level}
                onValueChange={(value: any) =>
                  setNewSkill((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={addSkill}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>

            {/* Skills List */}
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.experience}
                    </span>
                    <Badge className={getLevelColor(skill.level)}>
                      {skill.level}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Projects Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Previous Projects
            </h3>

            {/* Add New Project */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Organization"
                value={newProject.organization}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Duration (e.g., 2022-2023)"
                value={newProject.duration}
                onChange={(e) =>
                  setNewProject((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              />
              <div className="flex space-x-2">
                <Input
                  placeholder="Role"
                  value={newProject.role}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, role: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  onClick={addProject}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-2">
              {formData.previousProjects.map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {project.organization} • {project.role} •{" "}
                      {project.duration}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Organizations Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Previous Organizations
            </h3>

            {/* Add New Organization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Organization name"
                value={newOrganization.name}
                onChange={(e) =>
                  setNewOrganization((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Position"
                value={newOrganization.position}
                onChange={(e) =>
                  setNewOrganization((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
              />
              <div className="flex space-x-2">
                <Input
                  placeholder="Duration"
                  value={newOrganization.duration}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  onClick={addOrganization}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Organizations List */}
            <div className="space-y-2">
              {formData.previousOrganizations.map((org, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {org.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {org.position} • {org.duration}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrganization(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certifications
            </h3>

            {/* Add New Certification */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Certification name"
                value={newCertification.name}
                onChange={(e) =>
                  setNewCertification((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Issuing organization"
                value={newCertification.issuer}
                onChange={(e) =>
                  setNewCertification((prev) => ({
                    ...prev,
                    issuer: e.target.value,
                  }))
                }
              />
              <Input
                type="date"
                value={newCertification.date}
                onChange={(e) =>
                  setNewCertification((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
              <div className="flex space-x-2">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <Button
                  type="button"
                  onClick={addCertification}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Certifications List */}
            <div className="space-y-2">
              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {cert.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {cert.issuer} • {new Date(cert.date).toLocaleDateString()}{" "}
                      • {cert.fileName}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements
            </h3>

            {/* Add New Achievement */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Achievement title"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) =>
                    setNewAchievement((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  placeholder="Achievement description"
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Select
                    value={newAchievement.category}
                    onValueChange={(value) =>
                      setNewAchievement((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Project Management">
                        Project Management
                      </SelectItem>
                      <SelectItem value="Innovation">Innovation</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addAchievement}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {achievement.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {achievement.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()} •{" "}
                      {achievement.category}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Aspirations Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Career Aspirations
            </h3>

            {/* Add New Aspiration */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add your career aspiration"
                value={newAspiration}
                onChange={(e) => setNewAspiration(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAspiration())
                }
              />
              <Button
                type="button"
                onClick={addAspiration}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Aspirations List */}
            <div className="space-y-2">
              {formData.aspirations.map((aspiration, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                    <span className="text-gray-900 dark:text-white">
                      {aspiration}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAspiration(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {initialData ? "Update Records" : "Save Records"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberRecords;
