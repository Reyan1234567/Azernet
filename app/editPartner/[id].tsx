import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColor } from "@/hooks/useColor";
import CreateItemForm from "@/components/CreateItemForm";
import { SafeAreaView } from "react-native-safe-area-context";
import CreatePartner from "../createPartner";
import CreatePartnerForm from "@/components/CreatePartnerForm";

const PartnerForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  let itemId = params.id as string;
  if(itemId==="new")
    itemId=""

  const bgColor = useColor("background");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <CreatePartnerForm handleGoBack={()=>router.back()} id={itemId}/>
    </SafeAreaView>
  );
};

export default PartnerForm;
