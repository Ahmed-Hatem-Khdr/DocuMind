import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInDemoAccount: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsDemoUser(false);
      } else {
        // If not logged in via Firebase, fallback to initial default Demo Mode user if desired
        if (!user && !isDemoUser) {
          // Set demo user by default so preview works smoothly
          setIsDemoUser(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Email Sign In failed:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Email Sign Up failed:', error);
      throw error;
    }
  };

  const signInDemoAccount = () => {
    setUser(null);
    setIsDemoUser(true);
  };

  const signOut = async () => {
    try {
      if (user) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const value = {
    user,
    loading,
    isDemoUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInDemoAccount,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
