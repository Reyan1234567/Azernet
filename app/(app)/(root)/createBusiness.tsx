import { View } from "react-native";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react-native";
import { createBusinesses } from "@/service/business";
import { useAuth } from "@/context/authContext";
import { useBusiness } from "@/context/businessContext";
import { useColor } from "@/hooks/useColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../../components/ui/text";
import SnackBarToast from "@/components/SnackBarToast";
import { router } from "expo-router";

const Business = () => {
  const [businessName, setBusinesName] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = useColor("text");
  const AUTH = useAuth();
  const BUSINESS = useBusiness();
  const handleCreateBusinesses = async (name: string, id: string) => {
    try {
      console.log("name: ", name);
      console.log("id: ", id);
      setLoading(true);
      const newId = await createBusinesses(name, id);
      SnackBarToast({
        message: "Business Created!",
        isSuccess: true,
      });
      console.log("About to set context");
      BUSINESS.setBusinesses([
        ...BUSINESS.businesses,
        { id: newId, business_name: name },
      ]);
      BUSINESS?.setBusiness(newId);
      router.back();
    } catch (e) {
      if (e instanceof Error) {
        SnackBarToast({
          message: "Failed to Create Business!",
          isSuccess: false,
        });
        console.log(e.message);
        console.log(e.stack);
      } else {
        SnackBarToast({
          message: "Failed to Create Business!",
          isSuccess: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView>
      <Text
        variant="title"
        style={{ color: textColor, textAlign: "center", marginTop: 50 }}
      >
        What is your business called?
      </Text>
      <View
        style={{
          flexDirection: "column",
          gap: 10,
          padding: 10,
          paddingTop: 30,
        }}
      >
        <Input
          placeholder="Silkoat Paint Shop"
          icon={Store}
          value={businessName}
          onChangeText={(text) => setBusinesName(text)}
        />

        <Button
          onPress={async () => {
            if (!AUTH.session?.user.id) {
              return;
            }
            console.log("In the handler function: ", AUTH.session?.user.id);
            await handleCreateBusinesses(businessName, AUTH.session?.user.id);
          }}
          disabled={!businessName}
          loading={loading}
        >
          Submit
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Business;
