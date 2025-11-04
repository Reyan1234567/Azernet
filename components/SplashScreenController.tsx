import { useAuth } from "@/context/authContext";
import { useBusiness } from "@/context/businessContext";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const auth = useAuth();
  const business = useBusiness();
  if (!auth.isLoading) {
    SplashScreen.hide();
  }

  return null;
}
