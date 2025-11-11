import { StyleSheet } from "react-native";
import React from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useColor } from "@/hooks/useColor";

interface InventoryCardProps {
  itemName: string;
  leftAmount: number;
  key: number;
}

const InventoryCard = ({ itemName, leftAmount }: InventoryCardProps) => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={[styles.itemName, { color: textColor }]}>{itemName}</Text>
        <Text style={[styles.amount, { color: mutedColor }]}>
          {leftAmount} left
        </Text>
      </View>
    </Card>
  );
};

export default InventoryCard;

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  amount: {
    fontSize: 14,
  },
});
