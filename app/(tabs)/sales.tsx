import React from "react";
import { View } from "@/components/ui/view";
import TopBar from "@/components/topBar";
import SalesTransaction from "@/components/SalesTransaction";
import { useColor } from "@/hooks/useColor";

const Sales = () => {
  const bgColor = useColor("background");
  
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <SalesTransaction />
    </View>
  );
};

export default Sales;