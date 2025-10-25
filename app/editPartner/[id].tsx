import { View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Picker } from "@/components/ui/picker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColor } from "@/hooks/useColor";
import { ArrowLeft } from "lucide-react-native";
import {
  createPartner,
  editPartner,
  getSinglePartner,
  partner
} from "@/service/partners";
import { useToast } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  firstname: z.string().min(1, "first name is required"),
  lastname: z.string().min(1, "last name is required"),
  phone_number: z.string().min(1, "phone number is required").max(10, "Phone number must start with 09 or 07 and be 10 characters long").regex(/^(09|07)[0-9]{8}$/, "phone number must be a start with 09 or 07"),
  role: z.string().min(1, "role is required"),
});

type formShemaValues = z.infer<typeof formSchema>;

const PartnerForm = () => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<formShemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone_number: "",
      role: "",
    },
  });
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const partnerId = params.id as string;
  const isEditMode = partnerId && partnerId !== "new";

  const bgColor = useColor("background");
  const textColor = useColor("text");
  const red = useColor("red");

  const options = [
    { label: "Customer", value: "Customer" },
    { label: "Supplier", value: "Supplier" },
  ];

  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["partners", partnerId],
    queryFn: async():Promise<partner> => await getSinglePartner(Number(partnerId)),
    enabled: isEditMode && !!partnerId && partnerId !== "new",
    staleTime:0,
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (isEditMode && data) {
      reset({
        firstname: data.first_name,
        lastname: data.last_name,
        phone_number: data.phone_number,
        role: data.role.substring(0, 1).toUpperCase() + data.role.substring(1),
      });
    }
  }, [isEditMode, data, reset]);

  const onSubmit = async (data: formShemaValues) => {
    try {
      if (isEditMode) {
        await editPartner({
          first_name: data.firstname,
          last_name: data.lastname,
          phone_number: data.phone_number,
          id: Number(partnerId),
          role: data.role,
          business_id:1
        });
        toast({
          title: "Success!",
          description: "Parnter info have been saved.",
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["partners"],
        });
      } else {
        await createPartner({
          first_name: data.firstname,
          last_name: data.lastname,
          phone_number: data.phone_number,
          role: data.role,
          business_id:1
        });
        toast({
          title: "Success!",
          description: "Partner created successfully",
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: ["partners"],
        });
      }
      router.back();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Coudn't create partner, something went wrong",
        variant: "error",
      });
      console.error("Error saving partner:", error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner size="default" variant="dots" label="Loading partner..." />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ color: red, marginBottom: 16 }}>
            {error?.message ?? "Failed to load partner"}
          </Text>
          <Button onPress={handleGoBack}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text
            variant="title"
            style={{
              fontSize: 25,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {isEditMode ? "Edit Partner" : "Create Partner"}
          </Text>
        </View>

        <View
          style={{ padding: 10, flexDirection: "column", gap: 10, flex: 1 }}
        >
          <Controller
            control={control}
            name="firstname"
            render={({ field }) => (
              <>
                  <Input
                    label="Firstname"
                    placeholder="Enter firstname"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!errors.firstname}
                  />
                  {errors.firstname && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.firstname.message}
                    </Text>
                  )}
              </>
            )}
          />

          <Controller
            control={control}
            name="lastname"
              render={({ field }) => (
                <>
                  <Input
                    label="Lastname"
                    placeholder="Enter lastname"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!errors.lastname}
                  />
                  {errors.lastname && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.lastname.message}
                    </Text>
                  )}
              </>
            )}
          />

          <Controller
            control={control}
            name="phone_number"
              render={({ field }) => (
                <>
                  <Input
                    label="Phone Number"
                    placeholder="+2519******"
                    keyboardType="phone-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!errors.phone_number}
                  />
                  {errors.phone_number && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.phone_number.message}
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
                    label="Role"
                    options={options}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select their role"
                  />
                  {errors.role && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.role.message}
                    </Text>
                  )}
              </>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
            { isEditMode
              ? "Update Partner"
              : "Create Partner"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PartnerForm;
