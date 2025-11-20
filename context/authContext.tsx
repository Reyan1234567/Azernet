import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Session } from "@supabase/supabase-js";
import * as SecureSession from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "@/service/profile";

interface userInfo {
  firstName: string;
  lastName: string;
  profilePic: string;
}

interface AuthContextValue {
  session: Session | null;
  phoneSignIn: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  profile: userInfo | null; 
  refetchProfile: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<userInfo | null>(null);

  const fetchUserProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user?.id) {
      setProfile(null);
      return;
    }

    try {
      const userData = await getProfile(currentSession.user.id);
      setProfile({
        firstName: userData.first_name,
        lastName: userData.last_name,
        profilePic: userData.profile_picture,
      });
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
  }, []);

  // 2. Initialization and Event Listeners
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          await fetchUserProfile(initialSession);
        }
      } catch (error) {
        console.error("Init session failed", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Listen for Auth Changes (Sign In, Sign Out, Auto-Refresh)
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log(`Auth Event: ${event}`);
      setSession(sess);

      if (event === 'SIGNED_IN' && sess) {
        // Fetch profile immediately upon login
        await fetchUserProfile(sess);
      } else if (event === 'SIGNED_OUT') {
        // Clear profile immediately upon logout
        setProfile(null);
        setSession(null); // Ensure session is cleared
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const phoneSignIn = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) throw error;
    // No need to setSession here manually, onAuthStateChange will catch it
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken;
      
      if (idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) throw error;
        // No need to setSession/fetchProfile here manually, onAuthStateChange will catch it
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    SecureSession.deleteItemAsync("businessId");
    if (error) throw error;
  };

  const refetchProfile = async () => {
    setIsLoading(true); 
    await fetchUserProfile(session);
    setIsLoading(false);
  };

  const value = useMemo(
    () => ({
      session,
      phoneSignIn,
      verifyOtp,
      signInWithGoogle,
      signOut,
      isLoading,
      profile,
      refetchProfile,
    }),
    [isLoading, profile, session, fetchUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}