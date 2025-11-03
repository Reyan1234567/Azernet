import { AuthContext } from "@/context/authContext";
import { SplashScreen } from "expo-router";
import { useContext } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const auth = useContext(AuthContext);
  if (!auth?.isLoading) {
    SplashScreen.hide();
  }

  return null;
}
