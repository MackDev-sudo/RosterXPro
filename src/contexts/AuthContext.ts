import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/auth';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    phone: string;
    profileImage?: File | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordRecovery: (email: string) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
