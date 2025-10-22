import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalSearchParams } from "expo-router";

interface unpaidAmount {
  name: string;
  amount: number;
  id: number;
}
const AmountUnpaid = ({ name, amount, id }: unpaidAmount) => {
  const [amountLeft, setAmountLeft] = useState(amount);
  const [clicked, setClicked] = useState(false);
  const toMe = useLocalSearchParams().type === "toMe";

  return (
    <View>
      {toMe ? (
        <Text>Unpaid Amount by {name} to you</Text>
      ) : (
        <Text>Unpaid Amount to {name} by you</Text>
      )}
      <Text>Amount.toFixed(2) ETB</Text>
      <Input
        value={amountLeft.toString()}
        onChange={(e) => {
          const text = e.target.value.trim().replace("/D/", "");
          setAmountLeft(Number(text));
        }}
      />
      {clicked ? (
        <Button
          onPress={() => {
            setClicked(true);
          }}
        >
          Mark as paid
        </Button>
      ) : (
        <Button>Cancel</Button>
      )}
      <Button>Save</Button>
    </View>
  );
};

export default AmountUnpaid;