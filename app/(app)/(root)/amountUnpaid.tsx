import React, { useState } from "react";
import { View, KeyboardAvoidingView } from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { useLocalSearchParams } from "expo-router";
import { Separator } from "@/components/ui/separator";
import { subtractUnpaidAmountPurchase } from "@/service/purchase";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import SnackBarToast from "@/components/SnackBarToast";

const AmountUnpaid = () => {
  const { id, debt } = useLocalSearchParams();
  const amount = parseFloat(Array.isArray(debt) ? debt[0] : debt); // this gonna show up small and at the top amount ETB
  const [amountLeft, setAmountLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const textColor = useColor("text");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const handleSubmit = async (id: number, debt: number) => {
    try {
      setLoading(true);
      await subtractUnpaidAmountPurchase(id, debt);
      SnackBarToast({
        message: "Amount Subtracted Successfully!",
        isSuccess: true,
        marginBottom: length,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["purchases"],
      });
    } catch (e) {
      console.error(e);
      SnackBarToast({
        message: "Failed to Subtract amount",
        isSuccess: true,
        marginBottom: length,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <KeyboardAvoidingView style={{ marginVertical: 10, padding: 15 }}>
        <Text variant={"caption"} style={{ textAlign: "center" }}>
          Initial Debt
        </Text>
        <Text
          variant={"title"}
          style={{ color: textColor, textAlign: "center" }}
        >
          {amount.toFixed(2)} ETB
        </Text>
        <View style={{ gap: 16 }}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
          >
            <Text variant={"caption"}>Amount left</Text>
            <Text variant="title" style={{ fontSize: 50, color: textColor }}>
              {(amount - amountLeft).toFixed(2)} ETB
            </Text>
          </View>
          <Input
            label="Debt"
            keyboardType="number-pad"
            value={amountLeft.toString()}
            onChange={(e) => {
              const text = Number(e.nativeEvent.text.replace(/\D/g, ""));
              setAmountLeft((_) => (text > amount ? amount : text));
            }}
            // onFocus={(e)=>e.nativeEvent.text}
          />
          <Button variant={"outline"} onPress={() => setAmountLeft(amount)}>
            Remove all Debt
          </Button>
          <Separator />
          <Button
            loading={loading}
            onPress={() => handleSubmit(Number(id), amountLeft)}
          >
            Save
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default AmountUnpaid;
