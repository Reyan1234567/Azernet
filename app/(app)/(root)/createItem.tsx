import { View } from "react-native";
import { Text } from "@/components/ui/text";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Picker } from "@/components/ui/picker";
import { OptionType } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";

const CreateItem = () => {
  const [measure, setMeasure] = useState("");
  const MeasureOptions: OptionType[] = [
    { value: "Item_based", label: "Item based" },
    { value: "Kilogram", label: "KG" },
    { value: "Liter", label: "Lt" },
  ];
  const [isEnabled, setIsEnabled] = useState(false);
  const [itemName, setItemName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  return (
    <SafeAreaView style={{ padding: 15 }}>
      <Text variant="title">Create an Item</Text>
      <Separator style={{ marginVertical: 15 }} />
      <Switch
        label="Are you registering a category of items?"
        value={isEnabled}
        onValueChange={setIsEnabled}
      />
      <View style={{ flexDirection: "column", gap: 10 }}>
        <Input
          label="Item Name"
          placeholder="Samsung A36"
          value={itemName}
          onChangeText={setItemName}
        />
        {!isEnabled && (
          <View style={{ flexDirection: "column", gap: 10 }}>
            <Input
              label="Purchase price"
              placeholder="1000 ETB"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
            />
            <Input
              label="Estimated Selling price"
              placeholder="1500 ETB"
              value={sellingPrice}
              onChangeText={setSellingPrice}
            />
          </View>
        )}

        <Picker
          options={MeasureOptions}
          value={measure}
          label="Measurement"
          onValueChange={setMeasure}
          placeholder="Select the measurement"
        />
        <Button>Submit</Button>
      </View>
    </SafeAreaView>
  );
};

export default CreateItem;
