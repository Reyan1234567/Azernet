import { TouchableOpacity, View } from "react-native";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useColor } from "@/hooks/useColor";
import { ArrowLeft } from "lucide-react-native";
import { Separator } from "./ui/separator";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Picker } from "./ui/picker";
import { createPartner } from "@/service/partners";
import { useToast } from "./ui/toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Role is required"),
});

type FormSchemaValues = z.infer<typeof formSchema>;

interface PartnerCreation {
  handleGoBack: () => void;
  fromBottom: boolean;
  bgColor: string;
}

const CreatePartnerForm = ({
  handleGoBack,
  fromBottom,
  bgColor,
}: PartnerCreation) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "",
    },
  });

  const roleOptions = [
    { value: "customer", label: "Customer" },
    { value: "supplier", label: "Supplier" },
  ];

  const textColor = useColor("text");
  const red = useColor("red");
  const { toast } = useToast();

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      await createPartner({
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        role: data.role,
        business_id:1
      });
      
      // Invalidate queries to refresh partner lists
      queryClient.invalidateQueries({ queryKey: ["editTransactionData"] });
      queryClient.invalidateQueries({ queryKey: ["editCategoryTransactionData"] });
      
      toast({
        title: "Success!",
        description: "Partner created successfully",
        variant: "success",
      });
      handleGoBack();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Couldn't save partner, something went wrong",
        variant: "error",
      });
      console.error("Error saving partner:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            paddingBottom: 0,
          }}
        >
          {!fromBottom && (
            <TouchableOpacity
              onPress={handleGoBack}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text
            variant="title"
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            Create Partner
          </Text>
        </View>

        <View
          style={{ padding: 10, flexDirection: "column", gap: 10, flex: 1 }}
        >
          <Separator style={{ marginVertical: 15 }} />

          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <>
                <Input
                  variant="outline"
                  label="First Name"
                  placeholder="John"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {errors.firstName && (
                  <Text style={{ color: red, marginTop: -5 }}>
                    {errors.firstName.message}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <>
                <Input
                  variant="outline"
                  label="Last Name"
                  placeholder="Doe"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {errors.lastName && (
                  <Text style={{ color: red, marginTop: -5 }}>
                    {errors.lastName.message}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <>
                <Input
                  variant="outline"
                  label="Phone Number"
                  placeholder="+2519********"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="phone-pad"
                />
                {errors.phoneNumber && (
                  <Text style={{ color: red, marginTop: -5 }}>
                    {errors.phoneNumber.message}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <>
                <Picker
                  variant="outline"
                  label="Role"
                  options={roleOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select their role"
                />
                {errors.role && (
                  <Text style={{ color: red, marginTop: -5 }}>
                    {errors.role.message}
                  </Text>
                )}
              </>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Submit"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreatePartnerForm;
