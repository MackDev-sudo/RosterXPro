import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from './supabase';

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  phone: string;
  profileImage?: File | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

class AuthService {
  // Create new user account
  async createUser(userData: CreateUserData): Promise<{ user: User; needsEmailConfirmation: boolean }> {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            phone: userData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        throw new Error(`Registration failed: ${error.message}`);
      }
      if (!data.user) throw new Error('User creation failed - no user returned');

      // Check if email confirmation is required
      if (!data.user.email_confirmed_at) {
        // Email confirmation is required - don't create profile yet
        console.log('Email confirmation required for:', data.user.email);
        return { user: data.user, needsEmailConfirmation: true };
      }

      // Email is already confirmed, complete registration
      const completedUser = await this.completeUserRegistration(data.user, userData);
      return { user: completedUser, needsEmailConfirmation: false };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Complete user registration after email confirmation
  async completeUserRegistration(user: User, userData: CreateUserData): Promise<User> {
    try {
      // Upload profile image if provided
      let profileImageUrl: string | null = null;
      if (userData.profileImage) {
        try {
          profileImageUrl = await this.uploadProfileImage(userData.profileImage, user.id);
        } catch (uploadError) {
          console.error('Profile image upload failed:', uploadError);
          // Continue without profile image rather than failing completely
        }
      }

      // Create user profile in database
      try {
        await this.createUserProfile({
          user_id: user.id,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          profile_image_url: profileImageUrl,
        });
      } catch (profileError) {
        console.error('Profile creation failed:', profileError);
        // If profile creation fails, we should still return the user
        // The profile can be created later
        throw new Error('Registration completed but profile creation failed. Please contact support or try logging in.');
      }

      return user;
    } catch (error) {
      console.error('Error completing user registration:', error);
      throw error;
    }
  }

  // Login user
  async loginUser(loginData: LoginData): Promise<Session> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('Login failed');

      return data.session;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  // Social login (Google, GitHub, etc.)
  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user profile from database
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('AuthService: Getting user profile for userId:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('AuthService: Error getting user profile:', error);
        return null;
      }
      
      console.log('AuthService: User profile retrieved:', data);
      return data;
    } catch (error) {
      console.error('AuthService: Exception getting user profile:', error);
      return null;
    }
  }

  // Create user profile in database
  async createUserProfile(profileData: Database['public']['Tables']['user_profiles']['Insert']): Promise<UserProfile> {
    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', profileData.user_id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists for user:', profileData.user_id);
        // Return existing profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', profileData.user_id)
          .single();
        return profile!;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating profile:', error);
        if (error.code === 'PGRST116') {
          throw new Error('User profiles table does not exist. Please run the database setup script.');
        }
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check RLS policies are set up correctly.');
        }
        if (error.code === '23505') {
          // Unique constraint violation - profile already exists
          console.log('Profile already exists (unique constraint), fetching existing profile...');
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', profileData.user_id)
            .single();
          if (existingProfile) {
            return existingProfile;
          }
        }
        throw new Error(`Profile creation failed: ${error.message}`);
      }
      if (!data) throw new Error('Profile creation failed - no data returned');

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error sending password recovery:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Database['public']['Tables']['user_profiles']['Update']
  ): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get auth session
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
export default authService;
