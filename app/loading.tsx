import { StyleSheet, View } from "react-native";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

const loading = () => {
  return (
    <View>
      <Spinner />
    </View>
  );
};

export default loading;

const styles = StyleSheet.create({});
