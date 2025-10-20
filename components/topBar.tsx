import { StyleSheet } from "react-native";
import React, { useState } from "react";
import { Bell, Menu } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { View } from "@/components/ui/view";
import { SheetLeft } from "./Sheet";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const secondary = useColor("secondary");
  const primaryColor = useColor("primary");

  return (
    <>
      <View
        style={{
          backgroundColor: secondary,
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 20,
          paddingTop:30
        //   paddingVertical:20
        }}
      >
        <Menu onPress={() => setOpen((now) => !now)} color={primaryColor} />
        <Bell color={primaryColor} />
      </View>
      <SheetLeft open={open} setOpen={setOpen} />
    </>
  );
};

export default TopBar;
