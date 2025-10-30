import { StyleSheet, TouchableOpacity } from "react-native";
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
          padding: 15,
          paddingTop:30
        }}
      >
        <TouchableOpacity style={{padding:10}} onPress={() => setOpen((now) => !now)}><Menu  color={primaryColor} /></TouchableOpacity>
        <Bell style={{padding:10}} color={primaryColor} />
      </View>
      <SheetLeft open={open} setOpen={setOpen} />
    </>
  );
};

export default TopBar;
