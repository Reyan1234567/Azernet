import React from "react";
import { View } from "@/components/ui/view";
import TopBar from "@/components/topBar";
import OrdersComponent from "@/components/OrdersComponent";
import { useColor } from "@/hooks/useColor";

const Orders = () => {
  const bgColor = useColor("background");
  
  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <OrdersComponent />
    </View>
  );
};

export default Orders;
