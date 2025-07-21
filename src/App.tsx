import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import { OrganizationDashboard } from './components/OrganizationDashboard';
import OnboardingPage from './pages/main/OnboardingPage';
import { AuthProvider } from './contexts/AuthContext.tsx'
import { useAuth } from './hooks/useAuth'
import { organizationService } from './lib/organizationService';
import { authService } from './lib/auth';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);
  const path = window.location.pathname;

  // Add timeout for auth loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        setAuthTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading]);

  useEffect(() => {
    // Only proceed when auth loading is complete
    if (!authLoading) {
      if (user) {
        console.log('App: User is authenticated:', {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        });
        checkUserOrganization();
      } else {
        console.log('App: No user found, setting hasOrganization to false');
        // User is not authenticated, set loading to false
        setHasOrganization(false);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  // Clear authentication and redirect to login
  const clearAuthAndRedirect = async () => {
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error clearing auth:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const checkUserOrganization = async () => {
    if (!user) return;

    try {
      // First, check if the user profile exists in the database
      // This will catch cases where the user was deleted from database but session persists
      const userProfile = await authService.getUserProfile(user.id);
      
      if (!userProfile) {
        console.log('User profile not found in database, clearing session...');
        // User was deleted from database but session still exists
        // Clear the session and redirect to login
        await clearAuthAndRedirect();
        return;
      }

      // If profile exists, check if user has organization
      const hasOrg = await organizationService.userHasOrganization(user.id);
      setHasOrganization(hasOrg);
    } catch (error) {
      console.error('Error checking user organization:', error);
      setHasOrganization(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle auth callback first
  if (path === '/auth/callback') {
    return <AuthCallbackPage />;
  }

  // If user is authenticated, show loading, dashboard, or onboarding
  if (user) {
    // Show loading while auth is loading OR while checking organization (with timeout fallback)
    if ((authLoading || loading) && !authTimeout) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // If user has organization, show the organization dashboard
    if (hasOrganization) {
      return <OrganizationDashboard />;
    }

    // If user doesn't have an organization, show the onboarding page
    return <OnboardingPage />;
  }

  // If user is not authenticated or auth timed out, show landing page
  return <LandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
