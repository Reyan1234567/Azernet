import { View } from "react-native";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react-native";
import { createBusinesses } from "@/service/business";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/businessContext";
import { useColor } from "@/hooks/useColor";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../../components/ui/text";

const Business = () => {
  const [businessName, setBusinesName] = useState("");
  const [loading, setLoading] = useState(false);
  const textColor = useColor("text");
  const AUTH = useAuth();
  const BUSINESS = useBusiness();
  const { toast } = useToast();
  const handleCreateBusinesses = async (name: string, id: number) => {
    try {
      setLoading(true);
      const newId = await createBusinesses(name, id);
      toast({
        title: "Business Created!",
        description: "Your business has been successfully registered",
        duration: 3000,
        variant: "success",
      });
      console.log("About to set context");
      BUSINESS?.setBusiness(newId.toString());
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Failed to Create Business",
          description: e.message,
          duration: 5000,
          variant: "error",
        });
        console.log(e.message);
        console.log(e.stack);
      } else {
        toast({
          title: "Failed to Create Business",
          description: "Something went wrong when creating business",
          duration: 5000,
          variant: "error",
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
            await handleCreateBusinesses(
              businessName,
              Number(AUTH?.session?.user.id)
            );
          }}
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
