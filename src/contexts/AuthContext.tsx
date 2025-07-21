import React, { useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/auth';
import { AuthContext, type AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Check if we have a session
        const session = await authService.getSession();
        
        if (session?.user && mounted) {
          setUser(session.user);
          
          // Get user profile asynchronously - don't block auth completion
          authService.getUserProfile(session.user.id)
            .then((profile) => {
              if (mounted) {
                setUserProfile(profile);
              }
            })
            .catch((profileError) => {
              console.warn('AuthContext: Profile fetch failed:', profileError);
              if (mounted) {
                setUserProfile(null);
              }
            });
        }
      } catch (error) {
        console.error('AuthContext: Auth init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      
      console.log('AuthContext: Auth state changed, session:', session);
      
      try {
        if (session?.user) {
          setUser(session.user);
          
          // Get user profile asynchronously - don't block auth completion
          authService.getUserProfile(session.user.id)
            .then(async (profile) => {
              if (mounted) {
                if (!profile) {
                  // Profile doesn't exist - this is expected for users who haven't confirmed email yet
                  console.log('AuthContext: No profile found. Profile will be created after email confirmation.');
                  setUserProfile(null);
                } else {
                  console.log('AuthContext: Profile found:', profile);
                  setUserProfile(profile);
                }
              }
            })
            .catch((profileError) => {
              console.warn('AuthContext: Profile fetch failed in auth change:', profileError);
              if (mounted) {
                setUserProfile(null);
              }
            });
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('AuthContext: Error handling auth state change:', error);
        // Still set the user if we have one, even if profile fails
        if (session?.user && mounted) {
          setUser(session.user);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.loginUser({ email, password });
      // Let auth state change listener handle the rest
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false); // Only set loading to false on error
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    phone: string;
    profileImage?: File | null;
  }) => {
    try {
      setLoading(true);
      const result = await authService.createUser(userData);
      
      if (result.needsEmailConfirmation) {
        // Email confirmation is required
        // Don't set user or profile yet - wait for email confirmation
        // Registration succeeded, but user needs to check email
        return;
      }
      
      // Email was already confirmed, user is fully registered
      setUser(result.user);
      
      // Get user profile after registration
      const profile = await authService.getUserProfile(result.user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordRecovery = async (email: string) => {
    try {
      await authService.sendPasswordRecovery(email);
    } catch (error) {
      console.error('Password recovery failed:', error);
      throw error;
    }
  };

  const clearSession = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Clear session failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    sendPasswordRecovery,
    clearSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
