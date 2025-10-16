import React from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "./ui/toast";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { changeStatus } from "@/service/orders";
import { ORDERSTATUS } from "@/constants";

const saleFormSchema = z.object({
  pricePerItemS: z.number().min(0.01, "Price must be greater than 0"),
  unpaidAmountS: z.number().min(0, "Unpaid amount cannot be negative"),
});

type SaleFormData = z.infer<typeof saleFormSchema>;

interface SaleFormComponentProps {
  id: number;
}

const SaleFormComponent: React.FC<SaleFormComponentProps> = ({ id }) => {
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      pricePerItemS: 0,
      unpaidAmountS: 0,
    },
  });

  const handleFormSubmit = async (data: SaleFormData) => {
    try {
      await changeStatus(
        ORDERSTATUS.DELIVERED,
        id,
        data.pricePerItemS,
        data.unpaidAmountS
      );
      toast({
        title: "Sale data submitted successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to submit sale data",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    }
  };

  return (
    <View style={{ gap: 20, padding: 16 }}>
      <Controller
        control={control}
        name="pricePerItemS"
        render={({ field }) => (
          <Input
            label="Price Per Item (Sale)"
            placeholder="Enter price per item"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            keyboardType="numeric"
            error={errors.pricePerItemS?.message}
          />
        )}
      />
      {errors.pricePerItemS && (
        <Text style={{ color: "red", fontSize: 14 }}>
          {errors.pricePerItemS.message}
        </Text>
      )}

      <Controller
        control={control}
        name="unpaidAmountS"
        render={({ field }) => (
          <Input
            label="Unpaid Amount (Sale)"
            placeholder="Enter unpaid amount"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            keyboardType="numeric"
            error={errors.unpaidAmountS?.message}
          />
        )}
      />
      {errors.unpaidAmountS && (
        <Text style={{ color: "red", fontSize: 14 }}>
          {errors.unpaidAmountS.message}
        </Text>
      )}

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <Button
          onPress={handleSubmit(handleFormSubmit)}
          style={{ flex: 1 }}
          loading={isSubmitting}
        >
          Submit Sale Data
        </Button>
      </View>
    </View>
  );
};

export default SaleFormComponent;
