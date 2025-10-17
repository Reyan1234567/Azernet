import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
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
import { useColor } from "@/hooks/useColor";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";

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
  const textColor=useColor("text")
  const primary=useColor("primary")
  const [quantity, setQuantity] = useState(0);
  const [pricePerItem, setPricePerItem] = useState(0);
  
  const queryClient = useQueryClient();
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

  const [selectedSupplier, setSelectedSupplier] = React.useState<OptionType | null>(null);

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
        queryKey: ["orders"]
      });
      router.back();
    } catch (error: any) {
      toast({
        title: "Failed to submit purchase data",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    }
  };

  // Show loading spinner while data is being fetched
  if (suppliersLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Spinner/>
        <Text style={{ marginTop: 16, color: textColor}}>
          Loading suppliers...
        </Text>
      </View>
    );
  }

  // Show error state if fetching failed
  if (suppliersError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Error loading suppliers: {suppliersError.message}
        </Text>
        <Button onPress={() => queryClient.refetchQueries({ queryKey: ["suppliers-purchase"] })} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  // Render the actual form only when data is available
  return (
    <View style={{ gap: 20, padding: 16 }}>
      <Text variant="heading" style={{ color: textColor}}>
        Place a Purchase
      </Text>

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
              setPricePerItem(Number(text));
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
              setQuantity(Number(text));
              field.onChange(Number(text));
            }}
            keyboardType="numeric"
            error={errors.unpaidAmountP?.message}
          />  
        )}
      />
      <Separator/>
      <View style={{ flexDirection: "row", justifyContent: "space-between", margin: 5, marginTop: 10 }}>
        <Text variant="caption" style={{ color: textColor}}>LINE TOTAL: </Text>
        <Text variant="caption" style={{ color: textColor}}>{quantity * pricePerItem}</Text>
      </View>
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