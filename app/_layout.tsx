import { SplashScreenController } from "@/components/SplashScreenController";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider, useAuth } from "@/context/authContext";
import { BusinessProvider, useBusiness } from "@/context/businessContext";
import { ThemeProvider } from "@/theme/theme-provider";
import { Stack } from "expo-router";

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
  const auth = useAuth();
  const business = useBusiness();

  console.log("The authsession", !!auth?.session);
  console.log("The Business Id", !business?.businessId);
  console.log(business?.businessId);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Stack>
          <Stack.Protected guard={!!auth?.session && !!business?.businessId}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!!auth?.session && business.isLoading}>
            <Stack.Screen name="loading" options={{ headerShown: false }} />
          </Stack.Protected>
          {/* if value in guard is true then make the screen inside visible */}
          <Stack.Protected guard={!auth?.session}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
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
