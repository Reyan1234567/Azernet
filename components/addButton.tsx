import { Button } from "@/components/ui/button";
import React from "react";
import { useColor } from "@/hooks/useColor";
import { Plus, View } from "lucide-react-native";

const AddButton = ({ onPress }: { onPress: () => void }) => {
  const primaryColor = useColor("primary");
  return (
    <Button
      variant="default"
      size="lg"
      icon={Plus}
      style={{
        width: 40,
        height: 40,
        borderRadius: 28,
        backgroundColor: primaryColor,
      }}
      onPress={onPress}
    />
  );
};

export default AddButton;
