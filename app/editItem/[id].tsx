import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColor } from "@/hooks/useColor";
import CreateItemForm from "@/components/CreateItemForm";
import { SafeAreaView } from "react-native-safe-area-context";

const ItemForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const itemId = params.id as string;
  const isEditMode = itemId && itemId !== "new";

  const bgColor = useColor("background");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <CreateItemForm isEditMode={isEditMode} handleGoBack={()=>router.back()} itemId={itemId} fromBottom={false} bgColor={bgColor}/>
    </SafeAreaView>
  );
};

export default ItemForm;
