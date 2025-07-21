import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing email confirmation...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) return;
    
    const handleAuthCallback = async () => {
      try {
        setHasProcessed(true);
        
        // Check URL for auth tokens (email confirmation)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Tokens are present, email confirmation successful
          setStatus('success');
          setMessage('Email confirmed successfully! Creating profile...');
          
          // Set the session with the tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setStatus('error');
            setMessage('Failed to set session. Please try again.');
            return;
          }
          
          if (sessionData.session) {
            // Now create the user profile since email is confirmed
            const userId = sessionData.session.user.id;
            const user = sessionData.session.user;
            const userMetadata = user.user_metadata || {};
            
            console.log('Creating user profile for confirmed user:', user.email);
            console.log('User metadata:', userMetadata);
            
            try {
              await authService.createUserProfile({
                user_id: userId,
                username: userMetadata.username || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: userMetadata.phone || null,
                profile_image_url: null,
              });
              
              setMessage('Profile created successfully! Redirecting...');
            } catch (profileError) {
              console.error('Error creating profile:', profileError);
              const errorMessage = profileError instanceof Error ? profileError.message : String(profileError);
              if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
                console.log('Profile already exists, continuing...');
                setMessage('Profile already exists! Redirecting...');
              } else {
                setMessage('Email confirmed but profile creation failed. Redirecting...');
              }
            }
          }
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          // No tokens - check if user is already logged in
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            return;
          }

          if (data.session) {
            // User is already authenticated (probably already logged in)
            setStatus('success');
            setMessage('Already authenticated! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            // No session and no tokens
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            
            // Redirect to login after delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    handleAuthCallback();
  }, [hasProcessed]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
