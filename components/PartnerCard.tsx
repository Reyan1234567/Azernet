import React from "react";
import { View } from "react-native";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Edit, Trash2, Phone } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";

interface Partner {
    id: number,
    first_name: string,
    last_name: string,
    phone_number: string,
    role:string;
}

interface PartnerCardProps {
  partner: Partner;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PartnerCard= ({ partner, onEdit, onDelete }:PartnerCardProps) => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");

  return (
    <Card style={{ marginVertical: 8 }}>
      <View style={{ padding: 16 }}>
        <View style={{ marginBottom: 12 }}>
          <Text variant="title" style={{ fontSize: 18, fontWeight: "600", marginBottom: 4, color: textColor }}>
            {partner.first_name} {partner.last_name}
          </Text>
          <Text variant="body" style={{ color: mutedColor, fontSize: 14, marginBottom: 8 }}>
            {partner.role}
          </Text>
          {partner.phone_number && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Phone size={16} color={mutedColor} />
              <Text variant="body" style={{ fontSize: 14, color: textColor }}>
                {partner.phone_number}
              </Text>
            </View>
          )}
        </View>
        <Separator style={{ marginVertical: 12 }} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            style={{ flex: 1 }}
            onPress={() => onEdit(partner.id.toString())}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            style={{ flex: 1 }}
            onPress={() => onDelete(partner.id.toString())}
          >
            Delete
          </Button>
        </View>
      </View>
    </Card>
  );
};

export default PartnerCard;