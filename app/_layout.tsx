import { SplashScreenController } from "@/components/SplashScreenController";
import { ToastProvider } from "@/components/ui/toast";
import { AuthContext, AuthProvider } from "@/context/authContext";
import { BusinessContext, BusinessProvider } from "@/context/businessContext";
import { ThemeProvider } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import { useContext } from "react";

export default function Root() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <SplashScreenController />
        <RootNavigator />
      </BusinessProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const auth = useContext(AuthContext);
  const business = useContext(BusinessContext);

  console.log(!!auth?.session);
  console.log(auth?.session);

  console.log(!business?.businessId);
  console.log(business?.businessId);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Stack>
          <Stack.Protected guard={!!auth?.session && !!business?.businessId}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>
          {/* if value in guard is true then make the screen inside visible */}
          <Stack.Protected guard={!auth?.session}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          <Stack.Protected guard={!!auth?.session && !business?.businessId}>
            <Stack.Screen
              name="firstBusiness"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
