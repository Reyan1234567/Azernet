import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useColor } from "@/hooks/useColor";
import { Edit, Trash2, Tag } from "lucide-react-native";

interface CategoryItem {
  id: string;
  name: string;
  createdAt?: string;
}

interface CategoryCardProps {
  category: CategoryItem;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");
  const cardBgColor = useColor("card");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      style={{
        backgroundColor: cardBgColor,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Category Icon */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${primaryColor}20`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Tag size={24} color={primaryColor} />
        </View>

        {/* Category Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="title"
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: textColor,
              marginBottom: 4,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {category.name}
          </Text>
          
          {category.createdAt && (
            <Text
              variant="caption"
              style={{
                color: mutedColor,
                fontSize: 12,
              }}
            >
              Created {formatDate(category.createdAt)}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onEdit}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: `${primaryColor}15`,
            }}
          >
            <Edit size={16} color={primaryColor} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#FF453A15",
            }}
          >
            <Trash2 size={16} color="#FF453A" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

export default CategoryCard;
