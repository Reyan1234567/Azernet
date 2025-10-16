import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { getListOfPartners } from "@/service/transaction";
import { useToast } from "./ui/toast";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  OptionType,
} from "./ui/combobox";
import { changeStatus } from "@/service/orders";
import { ORDERSTATUS } from "@/constants";
import { router } from "expo-router";

const purchaseFormSchema = z.object({
  supplierId: z.number().min(1, "Please select a supplier"),
  pricePerItemP: z.number().min(0.01, "Price must be greater than 0"),
  unpaidAmountP: z.number().min(0, "Unpaid amount cannot be negative"),
});

type PurchaseFormData = z.infer<typeof purchaseFormSchema>;

interface PurchaseFormComponentProps {
  id: number;
}

const PurchaseFormComponent: React.FC<PurchaseFormComponentProps> = ({
  id,
}) => {
  const { toast } = useToast();
  const queryClient=useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierId: 0,
      pricePerItemP: 0,
      unpaidAmountP: 0,
    },
  });

  const [selectedSupplier, setSelectedSupplier] =
    React.useState<OptionType | null>(null);

  // Fetch suppliers
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useQuery({
    queryKey: ["suppliers-purchase"],
    queryFn: async () => {
      const suppliers = await getListOfPartners(1);
      return suppliers;
    },
  });
  const [comboboxReady, setComboboxReady] = useState(false);

  useEffect(() => {
    // Give the BottomSheet time to fully render before enabling the combobox
    const timer = setTimeout(() => {
      setComboboxReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  const onSubmit = async (data: PurchaseFormData) => {
    try {
      await changeStatus(
        ORDERSTATUS.PURCHASED,
        id,
        data.pricePerItemP,
        data.unpaidAmountP,
        data.supplierId
      );
      toast({
        title: "Purchase data submitted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey:["orders"]
      })
      router.back()
    } catch (error: any) {
      toast({
        title: "Failed to submit purchase data",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    }
  };

  return (
    <View style={{ gap: 20, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Place a Purchase
      </Text>
      {suppliersLoading ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text>Loading suppliers...</Text>
        </View>
      ) : suppliersError ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "red" }}>
            Error loading suppliers: {suppliersError.message}
          </Text>
        </View>
      ) : (
        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => (
            <View style={{ zIndex: 1000 }}>
              <Combobox
                value={selectedSupplier}
                onValueChange={(option) => {
                  console.log("Combobox option selected:", option);
                  setSelectedSupplier(option);
                  field.onChange(Number(option?.value));
                }}
                disabled={!comboboxReady}
              >
                <ComboboxTrigger error={!!errors.supplierId}>
                  <ComboboxValue placeholder="Select supplier..." />
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput placeholder="Search suppliers..." />
                  <ComboboxList>
                    <ComboboxEmpty>
                      <Button>No suppliers found, create new</Button>
                    </ComboboxEmpty>
                    {suppliersData && suppliersData.length > 0 ? (
                      suppliersData.map((supplier) => (
                        <ComboboxItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.first_name + " " + supplier.last_name}
                        </ComboboxItem>
                      ))
                    ) : (
                      <ComboboxEmpty>
                        <Text>No suppliers available</Text>
                      </ComboboxEmpty>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </View>
          )}
        />
      )}
      {errors.supplierId && (
        <Text style={{ color: "red", fontSize: 14 }}>
          {errors.supplierId.message}
        </Text>
      )}

      <Controller
        control={control}
        name="pricePerItemP"
        render={({ field }) => (
          <Input
            label="Price Per Item (Purchase)"
            placeholder="Enter price per item"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            keyboardType="numeric"
            error={errors.pricePerItemP?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="unpaidAmountP"
        render={({ field }) => (
          <Input
            label="Unpaid Amount (Purchase)"
            placeholder="Enter unpaid amount"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            keyboardType="numeric"
            error={errors.unpaidAmountP?.message}
          />
        )}
      />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <Button
          onPress={handleSubmit(onSubmit)}
          style={{ flex: 1 }}
          loading={isSubmitting}
        >
          Submit Purchase Data
        </Button>
      </View>
    </View>
  );
};

export default PurchaseFormComponent;
