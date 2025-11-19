import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Session } from "@supabase/supabase-js";
import * as SecureSession from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { getProfile } from "@/service/profile";

// import * as AuthSession from "expo-auth-session";
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
  profile: userInfo;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.warn("AUTH PROVIDER RE-RENDERED");
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<userInfo>({
    firstName: "",
    lastName: "",
    profilePic: "",
  });

  const initializeSession = async () => {
    // console.warn("IN THE INIT SESSION");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // console.warn("Session:", session.user.id)
    setSession(session);
    if (session) {
      console.warn("SESSION PRESENT")
      try {
        const userData = await getProfile(session.user.id);
        console.warn("user_id: " + session.user.id);
        setProfile({
          firstName: userData.first_name,
          lastName: userData.last_name,
          profilePic: userData.profile_picture,
        });
        console.warn()
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        } else {
          throw new Error("Couldn't get userInfo");
        }
      }
    }
    setTimeout(() => setIsLoading(false), 200);
  };

  useEffect(() => {
    console.log("In the useEffect of the Session");
    initializeSession();
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    // setIsLoading(false);

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
      // if (Platform.OS === "web") {
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: "google",
      //   options: {
      //     redirectTo: "http://localhost:8081",
      //   },
      // });
      // if (error) {
      //   console.log(error.message);
      // }
      // // 1. Check for Play Services
      console.log("Before hasPlayServices");
      await GoogleSignin.hasPlayServices();
      // // 2. Get user info and ID token
      const userInfo = await GoogleSignin.signIn();
      console.log("UserInfo" + userInfo);
      const idToken = userInfo?.data?.idToken;
      console.log("idToken" + idToken);
      if (idToken) {
        console.log("In the if thing...");
        //   // 3. Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (error) {
          console.log("IN THE CATCH");
          console.log(error);
          console.log(error.message);
          throw error;
        }
        //   // SecureStore.setItem("userId", data.user.id);
        console.log("Google sign-in successful!", data.user);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Couldn't authenticate you"
      );
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    SecureSession.deleteItemAsync("businessId");
    if (error) throw error;
    setSession(null);
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
    }),
    [isLoading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
