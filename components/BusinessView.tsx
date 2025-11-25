import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import React, { ReactNode } from "react";
import { Briefcase, Building, Check, LucideIcon } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";

interface busV {
  name: string;
  key: number;
  onClick: () => void;
  icon: ReactNode;
  selected: boolean;
}
const BusinessView = ({ name, onClick, icon, selected }: busV) => {
  const textColor = useColor("text");
  const cardColor = useColor("card");
  const borderColor = useColor("foreground");
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onClick}>
      <View
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ ...styles.iconContainer, backgroundColor: cardColor, borderRadius:50}}>
          {icon}
        </View>
        <Text variant="caption" style={{ color: textColor }}>
          {name}
        </Text>
      </View>

      {selected && (
        <View
          style={{
            backgroundColor: borderColor,
            borderRadius: 50,
            padding: 5,
          }}
        >
          <Check size={15} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default BusinessView;

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});
