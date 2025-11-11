import React from "react";
import { View } from "react-native";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";

interface Item {
  id: string;
  name: string;
  measure: string;
  purchasePrice: number;
  sellingPrice: number;
  description?: string;
}

interface ItemCardProps {
  item: Item;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ItemCard = ({ item, onEdit, onDelete }: ItemCardProps) => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  return (
    <Card style={{ marginVertical: 8 }}>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="title" style={{ marginBottom: 4, color: textColor }}>
              {item.name?.trim() || "Unnamed Item"}
            </Text>
            <Text variant="body" style={{ color: mutedColor, marginBottom: 8 }}>
              Measure: {item.measure?.trim() || "No measure"}
            </Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, fontSize: 12 }}
                >
                  Purchase Price
                </Text>
                <Text
                  variant="body"
                  style={{ fontWeight: "600", color: textColor }}
                >
                  {(typeof item.purchasePrice === 'number' && !isNaN(item.purchasePrice) ? item.purchasePrice : 0).toFixed(2)} ETB
                </Text>
              </View>
              <View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, fontSize: 12 }}
                >
                  Selling Price
                </Text>
                <Text
                  variant="body"
                  style={{ fontWeight: "600", color: textColor }}
                >
                  {(typeof item.sellingPrice === 'number' && !isNaN(item.sellingPrice) ? item.sellingPrice : 0).toFixed(2)} ETB
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Separator style={{ marginVertical: 12 }} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            style={{ flex: 1 }}
            onPress={() => onEdit(item.id)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            style={{ flex: 1 }}
            onPress={() => onDelete(item.id)}
          >
            Delete
          </Button>
        </View>
      </View>
    </Card>
  );
};

export default ItemCard;