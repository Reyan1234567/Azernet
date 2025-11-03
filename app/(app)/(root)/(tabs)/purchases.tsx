import React from "react";
import { View } from "@/components/ui/view";
import TopBar from "@/components/topBar";
import PurchaseTransaction from "@/components/PurchaseTransaction";
import { useColor } from "@/hooks/useColor";

const Purchases = () => {
  const bgColor = useColor("background");

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <PurchaseTransaction />
    </View>
  );
};

export default Purchases;
