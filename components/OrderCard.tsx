import { OrderTransactionDisplay } from "@/service/transaction";
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
  ShoppingCart,
} from "lucide-react-native";

interface OrderCardProps {
  order: OrderTransactionDisplay;
  handleEdit: () => void;
  handleDelete: () => void;
}

const OrderCard = ({
  order,
  handleDelete,
  handleEdit,
}: OrderCardProps) => {
  const successColor = useColor("green");
  const textColor = useColor("text");
  const destructiveColor = useColor("red");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

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
            name={ShoppingCart}
            size={16}
            color={primaryColor}
          />
          <Text
            variant="caption"
            style={{
              color: primaryColor,
              fontWeight: "600",
            }}
          >
            ORDER
          </Text>
        </View>
        <Text variant="caption" style={{ color: mutedColor }}>
          {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Main Content */}
      <View style={{ marginBottom: 12 }}>
        <Text variant="title" style={{ marginBottom: 4, color: textColor }}>
          {order.description || "Order"} × {order.amount}
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          {order.description || "No description"}
        </Text>
      </View>

      {/* Partner Info */}
      {order.partners && (
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
            {`${order.partners.first_name} ${order.partners.last_name}`}
          </Text>
        </View>
      )}

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
            Total Price
          </Text>
          <Text variant="subtitle" style={{ color: textColor }}>
            ${order.line_total.toFixed(2)}
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
                order.unpaid_amount > 0
                  ? destructiveColor
                  : successColor,
              fontWeight: "600",
            }}
          >
            ${order.unpaid_amount.toFixed(2)}
          </Text>
          {order.unpaid_amount > 0 && (
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
            {order.amount} units
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

export default OrderCard;
