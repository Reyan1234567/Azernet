import { View } from "react-native";
import React, { useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react-native";
import { createBusinesses } from "@/service/business";
import { useAuth } from "@/context/authContext";
import { BusinessContext } from "@/context/businessContext";
import { useColor } from "@/hooks/useColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../components/ui/text";
import SnackBarToast from "@/components/SnackBarToast";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const Business = () => {
  const [businessName, setBusinesName] = useState("");
  const [loading, setLoading] = useState(false);
  const length=10
  const textColor = useColor("text");
  const AUTH = useAuth();
  const BUSINESS = useContext(BusinessContext);
  const handleCreateBusinesses = async (name: string, id: number) => {
    try {
      setLoading(true);
      const newId = await createBusinesses(name, id);
      SnackBarToast({
        message: "Business Created!",
        isSuccess: true,
        marginBottom: length,
      });
      console.log("About to set context");
      BUSINESS?.setBusiness(newId.toString());
    } catch (e) {
      if (e instanceof Error) {
        SnackBarToast({
          message: e.message,
          isSuccess: false,
          marginBottom: length,
        });
        console.log(e.message);
        console.log(e.stack);
      } else {
        SnackBarToast({
          message: "Failed to create Business",
          isSuccess: false,
          marginBottom: length,
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
          onPress={async () =>
            await handleCreateBusinesses(businessName, AUTH?.session?.user.id)
          }
          disabled={!businessName}
          loading={loading}
        >
          Submit
        </Button>
        {/* <Button onPress={() => AUTH?.signOut()}>Signout</Button> */}
      </View>
    </SafeAreaView>
  );
};

export default Business;
