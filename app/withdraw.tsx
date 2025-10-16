import { View } from "react-native";
import { Text } from "@/components/ui/text";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useColor } from "@/hooks/useColor";
import { createWithdraw } from "@/service/business_cash";
import { useToast } from "@/components/ui/toast";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  amount: z.number().min(1),
  description: z
    .string()
    .min(1, "Enter some description about the withdrawal made"),
});

type formType = z.infer<typeof formSchema>;

const Withdraw = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const textColor = useColor("text");
  const queryClient = useQueryClient();
  const red = useColor("red");
  const { toast } = useToast();
  const onSubmit = async (data: formType) => {
    try {
      await createWithdraw(1, data.amount, data.description);
      toast({
        title: "Withdrawal Successful",
        description: "Your withdrawal has been successfully recorded.",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["sumMoney"],
      });
      router.back();
    } catch (e: any) {
      toast({
        title: "Withdrawal Failed",
        description:
          e?.message ??
          "Something went wrong while processing your withdrawal.",
        variant: "error",
      });
    }
  };

  return (
    <View style={{ padding: 10, flexDirection: "column", gap: 15 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: textColor,
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        Withdraw From Business
      </Text>
      <Text
        variant="caption"
        style={{
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Enter the amount and a description for your withdrawal. Make sure you
        have enough funds available.
      </Text>
      <Separator />
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <Input
            label="Amount"
            placeholder="Enter amount to withdraw"
            value={field.value.toString()}
            onChangeText={(text) => {
              text = text.trim().replace(/\D/g, "");
              field.onChange(Number(text));
            }}
            error={!!errors.amount}
          />
        )}
      />
      {errors.amount && (
        <Text style={{ color: red, marginLeft: 4 }}>
          {errors.amount.message}
        </Text>
      )}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input
            label="Description"
            placeholder="Enter description"
            value={field.value}
            onChangeText={field.onChange}
            error={!!errors.description}
          />
        )}
      />
      {errors.description && (
        <Text style={{ color: red, marginLeft: 4 }}>
          {errors.description.message}
        </Text>
      )}
      <Button
        style={{ marginTop: 10 }}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        Withdraw
      </Button>
    </View>
  );
};

export default Withdraw;
