import { TouchableOpacity, StatusBar, useColorScheme } from "react-native";
import React, { useState } from "react";
import { Calculator, Menu } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { View } from "@/components/ui/view";
import { SheetLeft } from "./Sheet";
import { router } from "expo-router";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const secondary = useColor("secondary");
  const primaryColor = useColor("primary");
  const theme = useColorScheme();
  return (
    <>
      <View
        style={{
          backgroundColor: secondary,
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
          paddingTop: 30,
        }}
      >
        <StatusBar
          barStyle={theme !== "dark" ? "dark-content" : "light-content"}
        />
        <TouchableOpacity
          style={{ padding: 10 }}
          onPress={() => setOpen((now) => !now)}
        >
          <Menu color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 10 }}
          onPress={() => router.navigate("/(app)/(root)/calculator")}
        >
          <Calculator color={primaryColor} />
        </TouchableOpacity>
      </View>
      <SheetLeft open={open} setOpen={setOpen} />
    </>
  );
};

export default TopBar;
