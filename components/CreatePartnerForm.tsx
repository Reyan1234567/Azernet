import { View } from "react-native";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import React, { useContext, useEffect } from "react";
import { useColor } from "@/hooks/useColor";
import { Separator } from "./ui/separator";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Picker } from "./ui/picker";
import {
  createPartner,
  editPartner,
  getSinglePartner,
} from "@/service/partners";
import { useToast } from "./ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "./ui/spinner"; // Import the spinner
import { BusinessContext } from "@/context/businessContext";

interface PartnerCreation {
  handleGoBack: () => void;
  id?: string;
  bgColor?: string;
}

const CreatePartnerForm = ({ handleGoBack, id, bgColor }: PartnerCreation) => {
  const isEdit = !!id;
  const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(09|07)\d{8}$/, "Start with 09 or 07, length must be 10"),
    role: z.string().min(1, "Role is required"),
  });

  type FormSchemaValues = z.infer<typeof formSchema>;

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["partner", id],
    queryFn: () => getSinglePartner(Number(id)!),
    enabled: isEdit,
  });

  const {
    control,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (isEdit && data) {
      reset({
        firstName: data?.first_name || "",
        lastName: data?.last_name || "",
        phoneNumber: data?.phone_number || "",
        role: data?.role || "",
      });
    }
  }, [isEdit, data, reset]);

  const roleOptions = [
    { value: "customer", label: "Customer" },
    { value: "supplier", label: "Supplier" },
  ];

  const textColor = useColor("text");
  const BUSINESS=useContext(BusinessContext)
  const { toast } = useToast();

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      if (isEdit) {
        await editPartner({
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          role: data.role,
          id: Number(id),
          business_id: BUSINESS?.businessId,
        });

        queryClient.invalidateQueries({
          queryKey: ["partners"],
        });

        queryClient.invalidateQueries({
          queryKey: ["createPurchaseOrSale"],
        });

        toast({
          title: "Success!",
          description: "Partner edited successfully",
          variant: "success",
        });
      } else {
        await createPartner({
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          role: data.role,
          business_id: BUSINESS?.businessId,
        });

        queryClient.invalidateQueries({
          queryKey: ["partners"],
        });

        queryClient.invalidateQueries({
          queryKey: ["createPurchaseOrSale"],
        });

        toast({
          title: "Success!",
          description: "Partner created successfully",
          variant: "success",
        });
      }
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

  // Show loading spinner when fetching partner data for editing
  if (isEdit && isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }}>
        <Spinner/>
        <Text style={{ marginTop: 16, color: textColor }}>Loading partner data...</Text>
      </View>
    );
  }

  // Show error message if fetching partner data fails
  if (isEdit && isError) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text variant="title" style={{ color: textColor, textAlign: "center", marginBottom: 16 }}>
          Error Loading Partner
        </Text>
        <Text style={{ color: textColor, textAlign: "center", marginBottom: 24 }}>
          {error?.message || "Failed to load partner data. Please try again."}
        </Text>
        <Button onPress={handleGoBack} variant="outline">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
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
          <Text
            variant="title"
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {!isEdit ? "Create Partner" : "Edit Partner"}
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
                  error={errors.firstName?.message}
                />
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
                  error={errors.lastName?.message}
                />
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
                  error={errors.phoneNumber?.message}
                />
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
                  error={errors.role?.message}
                />
              </>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
            {!isEdit ? "Create Partner" : "Edit Partner"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default CreatePartnerForm;