import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Briefcase, Building, LucideIcon } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";

interface busV {
  name: string;
  key: number;
  onClick: () => void;
  icon: boolean;
  selected: boolean;
}
const BusinessView = ({ name, onClick, icon, selected }: busV) => {
  const textColor = useColor("text");
  const cardColor = useColor("card");
  const borderColor = useColor("border");
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onClick}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: selected ? borderColor : cardColor },
        ]}
      >
        {icon ? (
          <Building color={textColor} />
        ) : (
          <Briefcase color={textColor} />
        )}
      </View>
      <Text style={[styles.menuLabel, { color: textColor }]}>{name}</Text>
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
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
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
