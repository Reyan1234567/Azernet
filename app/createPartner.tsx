import { View } from "react-native";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Picker } from "@/components/ui/picker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";

const CreatePartner = () => {
  const options = [
    { label: "Customer", value: "customer" },
    { label: "Supplier", value: "supplier" },
  ];
  
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState<string>("");

  return (
    <View style={{ padding: 10, flexDirection: "column", gap: 10 }}>
      <Text variant="title">Create Partner</Text>
      <Separator style={{marginVertical:15}}/>
      <Input
        label="Firstname"
        value={firstname}
        onChangeText={setFirstname}
        placeholder="Enter firstname"
        error=""
      />
      <Input
        label="Lastname"
        value={lastname}
        onChangeText={setLastname}
        placeholder="Enter lastname"
        error=""
      />
      <Input
        label="Phone Number"
        placeholder="+2519******"
        error=""
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Picker
        options={options}
        value={value}
        label="Role"
        onValueChange={setValue}
        placeholder="Select their role"
      />
      <Button>Submit</Button>
    </View>
  );
};

export default CreatePartner;
