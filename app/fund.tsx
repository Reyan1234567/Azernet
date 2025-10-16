import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useColor } from "@/hooks/useColor";
import { useToast } from "@/components/ui/toast";
import * as z from "zod";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDeposit } from "@/service/business_cash";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  amount: z.number().min(1),
  description: z
    .string()
    .min(1, "Enter some descirpiton about the deposit made"),
});

type formType = z.infer<typeof formSchema>;
const Fund = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  const red = useColor("red");
  const onSubmit = async (data: formType) => {
    try {
      await createDeposit(1, data.amount, data.description);
      toast({
        title: "Deposit Successful",
        description: "Your deposit has been added to your business funds.",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["sumMoney"],
      });
      router.back();
    } catch (e) {
      toast({
        title: "Deposit Failed",
        description:
          e?.message ?? "Something went wrong while processing your deposit.",
        variant: "error",
      });
      console.log(e)
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
        render={({ field }) => (
          <Input
            label="Amount"
            placeholder="Enter amount to deposit"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            error={!!errors.amount}
          />
        )}
        name={"amount"}
      />
      {errors.amount && (
        <Text style={{ color: red, marginLeft: 10 }}>
          {errors.amount.message}
        </Text>
      )}
      <Controller
        control={control}
        render={({ field }) => (
          <Input
            label="Descirption"
            placeholder="Enter desciprtion"
            value={field.value}
            onChange={field.onChange}
            error={!!errors.description}
          />
        )}
        name={"description"}
      />
      {errors.description && (
        <Text style={{ color: red, marginLeft: 10 }}>
          {errors.description.message}
        </Text>
      )}
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
