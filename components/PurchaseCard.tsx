import { ItemTransactionDisplay } from "@/service/transaction";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import {
  User,
  Edit,
  Trash2,
  TrendingDown,
} from "lucide-react-native";

interface PurchaseCardProps {
  transaction: ItemTransactionDisplay;
  handleEdit: () => void;
  handleDelete: () => void;
}

const PurchaseCard = ({
  transaction,
  handleDelete,
  handleEdit,
}: PurchaseCardProps) => {
  const destructiveColor = useColor("red");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");

  return (
    <Card style={{ marginVertical: 8 }}>
      {/* Status Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon
            name={TrendingDown}
            size={16}
            color={destructiveColor}
          />
          <Text
            variant="caption"
            style={{
              color: destructiveColor,
              fontWeight: "600",
            }}
          >
            PURCHASE
          </Text>
        </View>
        <Text variant="caption" style={{ color: mutedColor }}>
          {new Date(transaction.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Main Content */}
      <View style={{ marginBottom: 12 }}>
        <Text variant="title" style={{ marginBottom: 4, color: textColor }}>
          {`${transaction.item_name} × ${transaction.amount}`}
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          {transaction.item_name}
        </Text>
      </View>

      {/* Partner Info */}
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
          {`${transaction.partner_first_name} ${transaction.partner_last_name}`}
        </Text>
      </View>

      <Separator style={{ marginVertical: 12 }} />

      {/* Financial Details */}
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
            Purchase Price
          </Text>
          <Text variant="subtitle" style={{ color: textColor }}>
            ${transaction.line_total.toFixed(2)}
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Unpaid Amount
          </Text>
          <Text
            variant="body"
            style={{
              color:
                transaction.unpaid_amount > 0
                  ? destructiveColor
                  : mutedColor,
              fontWeight: "600",
            }}
          >
            ${transaction.unpaid_amount.toFixed(2)}
          </Text>
          {transaction.unpaid_amount > 0 && (
            <Text
              variant="caption"
              style={{ color: destructiveColor, fontSize: 10 }}
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
            {transaction.amount} items
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          style={{ flex: 1 }}
          onPress={handleEdit}
        >
          Edit
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={Trash2}
          style={{ flex: 1 }}
          onPress={handleDelete}
        >
          Delete
        </Button>
      </View>
    </Card>
  );
};

export default PurchaseCard;

