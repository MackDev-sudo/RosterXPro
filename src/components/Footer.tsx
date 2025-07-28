import React from "react";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Company Info - Left */}
          <div className="flex items-center">
            <div className="w-6 h-6 mr-2">
              <img
                src="/mackdev_icon.png"
                alt="Mackdev Inc."
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Mackdev Inc.
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Empowering businesses through innovative solutions.
              </p>
            </div>
          </div>

          {/* Copyright - Right */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} RosterXPro. All rights reserved, Made with{" "}
            <Heart className="inline h-3 w-3 text-red-500" /> for enterprise
            teams.
          </p>
        </div>
      </div>
    </footer>
  );
};
