import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React, { useContext } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useColor } from "@/hooks/useColor";
// import { useToast } from "@/components/ui/toast";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDeposit } from "@/service/business_cash";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { BusinessContext } from "@/context/businessContext";
import SnackBarToast from "@/components/SnackBarToast";

const formSchema = z.object({
  amount: z.number().min(1),
  description: z
    .string()
    .min(1, "Enter some descirpiton about the deposit made"),
});

type formType = z.infer<typeof formSchema>;
const Fund = () => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });
  const textColor = useColor("text");
  const BUSINESS = useContext(BusinessContext);

  const onSubmit = async (data: formType) => {
    try {
      await createDeposit(BUSINESS?.businessId, data.amount, data.description);
      SnackBarToast({
        message:"Deposit Successful!",
        isSuccess:true
      })
      queryClient.invalidateQueries({
        queryKey: ["sumMoney"],
      });
      router.back();
    } catch (e) {
      if (e instanceof Error) {
        SnackBarToast({
          message:"Deposit Failed!",
          isSuccess:false
        })
      } else {
        SnackBarToast({
          message:"Deposit Failed!",
          isSuccess:false
        })
      }
      console.log(e);
    }
  };

  return (
    <View style={{ padding: 10, flexDirection: "column", gap: 15 }}>
      <Text variant="title" style={{ color: textColor, textAlign: "center" }}>
        Deposit From Business
      </Text>
      <Text
        variant="caption"
        style={{
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        The amount you enter here will be the money you inversted into your
        business and nothing else{" "}
      </Text>
      <Separator />
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <Input
            label="Amount"
            placeholder="Enter amount to deposit"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input
            label="Descirption"
            placeholder="Enter desciprtion"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.description?.message}
          />
        )}
      />

      <Button
        style={{ marginTop: 10 }}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        Deposit
      </Button>
    </View>
  );
};

export default Fund;
