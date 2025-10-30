import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Currency = ({currency}:{currency?:number}) => {
  {
    if (
      currency !== undefined &&
      currency !== null &&
      typeof currency == "number"
    ) {
      return (
        <Text>
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "ETB",
            notation:"compact"
          }).format(currency)}
        </Text>
      );
    } else {
        console.log(typeof currency)
        console.log(currency)
      return (
        <Text>
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "ETB",
          }).format(0)}
        </Text>
      );
    }
  }
};

export default Currency;

const styles = StyleSheet.create({});
