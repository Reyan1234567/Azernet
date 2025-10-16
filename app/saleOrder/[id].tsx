import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import SaleFormComponent from "@/components/SaleFormComponent";

const SaleOrder = () => {
  const modalId = useLocalSearchParams().id as string;

  return (
    <View>
      <SaleFormComponent id={Number(modalId)} />
    </View>
  );
};

export default SaleOrder;
