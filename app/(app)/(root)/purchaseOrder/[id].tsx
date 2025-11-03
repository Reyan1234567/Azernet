import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import PurchaseFormComponent from "@/components/PurchaseFormComponent";

const PurchaseOrder = () => {
  const modalId = useLocalSearchParams().id as string;

  return (
    <View style={{flex:1}}>
      <PurchaseFormComponent id={Number(modalId)} />
    </View>
  );
};

export default PurchaseOrder;
