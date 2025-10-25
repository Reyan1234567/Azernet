import { ItemTransactionDisplay } from "@/service/transaction";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import { User, TrendingUp, Recycle } from "lucide-react-native";

interface SalesCardProps {
  transaction: ItemTransactionDisplay;
  handleReverse: () => void;
  handleDebt: () => void;
}

const SalesCard = ({
  transaction,
  handleReverse,
  handleDebt,
}: SalesCardProps) => {
  const successColor = useColor("green");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");

  return (
    <Card style={{ marginVertical: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name={TrendingUp} size={16} color={successColor} />
          <Text
            variant="caption"
            style={{
              color: successColor,
              fontWeight: "600",
            }}
          >
            SALE
          </Text>
        </View>
        <Text variant="caption" style={{ color: mutedColor }}>
          {new Date(transaction.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text variant="title" style={{ marginBottom: 4, color: textColor }}>
          {`${transaction.item_name ?? "Item"} × ${transaction.amount ?? 0}`}
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          {transaction.item_name ?? "No item name"}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Icon name={User} size={16} color={mutedColor} />
        <Text variant="caption" style={{ color: mutedColor }}>
          {`${transaction.first_name ?? ""} ${
            transaction.last_name ?? ""
          }`.trim() || "No partner"}
        </Text>
      </View>

      <Separator style={{ marginVertical: 12 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Sale Price
          </Text>
          <Text variant="subtitle" style={{ color: textColor }}>
            ${(transaction.line_total ?? 0).toFixed(2)}
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Debt
          </Text>
          <Text
            variant="body"
            style={{
              color:
                (transaction.unpaid_amount ?? 0) > 0
                  ? successColor
                  : mutedColor,
              fontWeight: "600",
            }}
          >
            ${(transaction.unpaid_amount ?? 0).toFixed(2)}
          </Text>
          {transaction.unpaid_amount > 0 && (
            <Text
              variant="caption"
              style={{ color: successColor, fontSize: 10 }}
            >
              UNPAID
            </Text>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Quantity
          </Text>
          <Text variant="body" style={{ color: mutedColor }}>
            {transaction.amount ?? 0} items
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          icon={Recycle}
          style={{ flex: 1 }}
          onPress={handleReverse}
        >
          Reverse
        </Button>
        {transaction.unpaid_amount > 0 && (
          <Button
            size="sm"
            icon={Recycle}
            style={{ flex: 1 }}
            onPress={handleDebt}
          >
            Pay Debt
          </Button>
        )}
      </View>
    </Card>
  );
};

export default SalesCard;
