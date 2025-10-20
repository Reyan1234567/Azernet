import { ThemeProvider } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ThemeProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="createPartner"
                options={{ headerTitle: "" }}
              />
              <Stack.Screen name="createItem" options={{ headerTitle: "" }} />
              <Stack.Screen
                name="partners"
                options={{
                  headerTitle: "",
                  headerStyle: {
                    backgroundColor: "transparent",
                  },
                }}
              />
              <Stack.Screen
                name="items"
                options={{
                  headerTitle: "",
                  headerStyle: {
                    backgroundColor: "transparent",
                  },
                }}
              />
              <Stack.Screen
                name="editPartner/[id]"
                options={{ headerTitle: "", }}
              />
              <Stack.Screen
                name="editItem/[id]"
                options={{ headerTitle: "", }}
              />
              <Stack.Screen name="fund" options={{ headerTitle: "" }} />
              <Stack.Screen
                name="createPurchaseOrSale"
                options={{ headerTitle: "" }}
              />
              <Stack.Screen name="createOrder" options={{ headerTitle: "" }} />
              <Stack.Screen name="withdraw" options={{ headerTitle: "" }} />
              <Stack.Screen
                name="purchaseOrder/[id]"
                options={{ headerTitle: "" }}
              />
              <Stack.Screen
                name="saleOrder/[id]"
                options={{ headerTitle: "" }}
              />

              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ToastProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
