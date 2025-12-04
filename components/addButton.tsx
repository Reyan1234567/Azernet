import { Button } from "@/components/ui/button";
import React from "react";
import { useColor } from "@/hooks/useColor";
import { Plus, View } from "lucide-react-native";

const AddButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Button
      variant="default"
      size="lg"
      icon={Plus}
      style={{ minWidth: 50, height:45}}
      onPress={onPress}
    />
  );
};

export default AddButton;
