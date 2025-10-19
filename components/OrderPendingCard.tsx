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
  Trash2,
  ShoppingCart,
  CheckCircle,
} from "lucide-react-native";

interface OrderCardProps {
  order: OrderTransactionDisplay;
  handleDelete: () => void;
  handleMarkAsPurchased: () => void;
}

const OrderPendingCard = ({
  order,
  handleDelete,
  handleMarkAsPurchased,
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
          <Icon name={ShoppingCart} size={16} color={primaryColor} />
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
          {order.created_at
            ? new Date(order.created_at).toLocaleDateString()
            : "No date"}
        </Text>
      </View>

      {/* Main Content */}
      <View style={{ marginBottom: 12 }}>
        <Text variant="title" style={{ marginBottom: 4, color: textColor }}>
          {order.item_name ?? "Order"} × {order.number_of_items ?? 0}
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          {order.description ?? "No description"}
        </Text>
      </View>

      {/* Consumer Info */}
      {(order.consumer_first_name || order.consumer_last_name) && (
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
            {`${order.consumer_first_name || ""} ${
              order.consumer_last_name || ""
            }`.trim()}
          </Text>
        </View>
      )}

      <Separator style={{ marginVertical: 12 }} />

      {/* Status Indicator */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Status
          </Text>
          <Text
            variant="subtitle"
            style={{
              color:
                order.status === "pending" ? destructiveColor : successColor,
              fontWeight: "600",
            }}
          >
            {(order.status ?? "unknown").toUpperCase()}
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            variant="caption"
            style={{ color: mutedColor, marginBottom: 2 }}
          >
            Items
          </Text>
          <Text variant="body" style={{ color: textColor }}>
            {order.number_of_items ?? 0}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {order.status === "pending" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle}
              style={{ flex: 1 }}
              onPress={handleMarkAsPurchased}
            >
              Mark as Purchased
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
          </>
        ) : (
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text variant="caption" style={{ color: successColor }}>
              Order Completed
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export default OrderPendingCard;
