// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Session } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { Platform } from "react-native";

// import * as AuthSession from "expo-auth-session";

interface AuthContextValue {
  session: Session | null;
  phoneSignIn: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  // GoogleSignin.configure({
  //   webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  //   offlineAccess: true,
  // });

  const initializeSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
  };

  useEffect(() => {
    initializeSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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
    setSession(data.session);
  };

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "http://localhost:8081",
          },
        });
        if (error) {
          console.log(error.message);
        }
      } else {
        // // 1. Check for Play Services
        // await GoogleSignin.hasPlayServices();
        // // 2. Get user info and ID token
        // const userInfo = await GoogleSignin.signIn();
        // const idToken = userInfo?.data?.idToken;
        // if (idToken) {
        //   // 3. Sign in with Supabase
        //   const { data, error } = await supabase.auth.signInWithIdToken({
        //     provider: "google",
        //     token: idToken,
        //   });
        //   if (error) throw error;
        //   // SecureStore.setItem("userId", data.user.id);
        //   console.log("Google sign-in successful!", data.user);
        // }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
  };

  const value = useMemo(
    () => ({ session, phoneSignIn, verifyOtp, signInWithGoogle, signOut }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
