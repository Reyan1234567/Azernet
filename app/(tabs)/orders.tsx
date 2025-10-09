import React from "react";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import TopBar from "@/components/topBar";
import ItemTransaction from "@/components/ItemTransaction";

const Orders = () => {
  return (
    <View style={{flex:1}}>
      <TopBar />
      <ItemTransaction />
    </View>
  );
};

export default Orders;
