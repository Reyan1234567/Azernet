import { OrderTransactionDisplay } from "@/service/transaction";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import { User, Undo2, CheckCircle } from "lucide-react-native";

interface OrderCardProps {
  order: OrderTransactionDisplay;
  handleReverseToPurchased: () => void;
}

const OrderDeliveredCard = ({
  order,
  handleReverseToPurchased,
}: OrderCardProps) => {
  const successColor = useColor("green");
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
          <Icon name={CheckCircle} size={16} color={successColor} />
          <Text
            variant="caption"
            style={{
              color: successColor,
              fontWeight: "600",
            }}
          >
            DELIVERED
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

      {/* Status & Info Section */}
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
            Current Status
          </Text>
          <Text
            variant="subtitle"
            style={{
              color: successColor,
              fontWeight: "600",
            }}
          >
            DELIVERED
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

      {/* Completion Message */}
      <View
        style={{
          backgroundColor: `${successColor}15`,
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          borderLeftWidth: 3,
          borderLeftColor: successColor,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Icon name={CheckCircle} size={16} color={successColor} />
          <Text
            variant="caption"
            style={{ color: successColor, fontWeight: "600" }}
          >
            Order Completed
          </Text>
        </View>
        <Text variant="caption" style={{ color: mutedColor }}>
          This order has been successfully delivered to the customer.
        </Text>
      </View>

      {/* Action Button - Only Reverse */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          icon={Undo2}
          style={{ flex: 1 }}
          onPress={handleReverseToPurchased}
        >
          Reverse to Purchased
        </Button>
      </View>

      {/* Warning for Reverse Action */}
      <View style={{ marginTop: 8 }}>
        <Text
          variant="caption"
          style={{ color: mutedColor, textAlign: "center", fontSize: 10 }}
        >
          Reverse will move this order back to purchased state
        </Text>
      </View>
    </Card>
  );
};

export default OrderDeliveredCard;
