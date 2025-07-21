import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';

const EmailConfirmationPage: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'checking' | 'confirmed' | 'error'>('checking');

  useEffect(() => {
    // Check if user is now confirmed
    if (user?.email_confirmed_at) {
      setStatus('confirmed');
    } else {
      // Give it a moment to process the confirmation
      const timer = setTimeout(() => {
        if (user?.email_confirmed_at) {
          setStatus('confirmed');
        } else {
          setStatus('error');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'confirmed':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully confirmed. You can now close this page and return to the application.
            </p>
            <button
              onClick={() => window.close()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Error</h2>
            <p className="text-gray-600 mb-6">
              There was an issue confirming your email. Please try clicking the confirmation link again or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors mr-4"
            >
              Retry
            </button>
            <button
              onClick={() => window.close()}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center mb-6">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
