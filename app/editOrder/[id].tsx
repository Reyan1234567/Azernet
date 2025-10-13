import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/combobox";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { useColor } from "@/hooks/useColor";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrder,
  editOrder,
  getListOfPartners,
  getSingleOrder,
} from "@/service/transaction";
import { ArrowLeft } from "lucide-react-native";
import CreatePartnerForm from "@/components/CreatePartnerForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  partner: z.number({ required_error: "Type must be a number" }).optional(),
  amount: z
    .number({ required_error: "Type must be a number" })
    .min(1, "Fill in a valid amount"),
  price: z
    .number({ required_error: "Type must be a number" })
    .min(1, "Fill in a valid price"),
  unpaidAmount: z.number({ required_error: "Type must be a number" }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EditOrder = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const isEditMode = orderId && orderId !== "new";
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partner: 0,
      amount: 0,
      price: 0,
      unpaidAmount: 0,
      description: "",
    },
  });

  const primary = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("text");
  const bgColor = useColor("background");
  const [selectedPartner, setSelectedPartner] = useState<OptionType | null>(
    null
  );
  const [isPartnerBottomSheetVisible, setPartnerBottomSheetVisible] =
    useState(false);
  const [partnerComboboxKey, setPartnerComboboxKey] = useState(0);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);

  // Fetch data with useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["editOrderData", orderId],
    queryFn: async () => {
      const [partners, order] = await Promise.all([
        getListOfPartners(1),
        isEditMode
          ? getSingleOrder(Number(orderId))
          : Promise.resolve(null),
      ]);
      return { partners, order };
    },
    enabled: !!orderId,
  });

  // Reset form when data is loaded (only in edit mode)
  useEffect(() => {
    if (isEditMode && data?.order) {
      const { order } = data;

      reset({
        partner: order.partner_id || undefined,
        amount: order.amount || 0,
        price: order.pricePerItem || 0,
        unpaidAmount: order.unpaidAmount || 0,
        description: order.description || "",
      });

      if (order.partner_id) {
        setSelectedPartner({
          value: order.partner_id.toString(),
          label: `${order.partnerFirstname} ${order.partnerLastname}`,
        });
      }

      setAmount(order.amount || 0);
      setPrice(order.pricePerItem || 0);
    }
  }, [isEditMode, data, reset]);

  const handleOpenPartnerBottomSheet = () => {
    setPartnerComboboxKey((prev) => prev + 1);
    setPartnerBottomSheetVisible(true);
  };

  const secondaryBg = useColor("card");
  const lineTotal = amount && price ? (amount * price).toFixed(2) : "0.00";

  const onSubmit = async (formData: FormData) => {
    try {
      if (isEditMode) {
        await editOrder({
          id: Number(orderId),
          partner: formData.partner,
          type: "order",
          amount: formData.amount,
          price: formData.price,
          unpaidAmount: formData.unpaidAmount,
          lineTotal: Number(lineTotal),
          description: formData.description,
        });
      } else {
        await createOrder({
          partner: formData.partner,
          type: "order",
          amount: formData.amount,
          price: formData.price,
          unpaidAmount: formData.unpaidAmount,
          lineTotal: Number(lineTotal),
          description: formData.description,
        });
      }
      toast({
        title: isEditMode
          ? "Order updated successfully"
          : "Order created successfully",
        variant: "success",
      });
      router.back();
    } catch (e) {
      toast({
        title: isEditMode
          ? "Failed to update order"
          : "Failed to create order",
        variant: "error",
      });
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
          <Spinner
            size="default"
            variant="dots"
            label="Loading order..."
          />
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
            {error?.message ?? "Failed to load order"}
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
          <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text
            variant="title"
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {isEditMode ? "Edit Order" : "Create Order"}
          </Text>
        </View>

        <ScrollView
          style={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        >
          <Separator style={{ marginVertical: 15 }} />
          <View style={{ flexDirection: "column", gap: 15 }}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  label="Description (Optional)"
                  placeholder="Order description"
                  value={field.value}
                  onChangeText={field.onChange}
                  type="textarea"
                />
              )}
            />

            <Controller
              control={control}
              name="partner"
              render={({ field }) => (
                <Combobox
                  key={partnerComboboxKey}
                  value={selectedPartner}
                  onValueChange={(option) => {
                    setSelectedPartner(option);
                    field.onChange(Number(option?.value));
                  }}
                >
                  <ComboboxTrigger>
                    <ComboboxValue placeholder="Select partner (Optional)..." />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxInput placeholder="Search partners..." />
                    <ComboboxList>
                      <ComboboxEmpty>
                        <Button onPress={handleOpenPartnerBottomSheet}>
                          No partner found. Create new
                        </Button>
                      </ComboboxEmpty>
                      {data?.partners.map((partner) => (
                        <ComboboxItem
                          key={partner.id}
                          value={partner.id.toString()}
                        >
                          {partner.first_name + " " + partner.last_name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            <Separator style={{ marginVertical: 15 }} />
            
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  label="Amount"
                  placeholder="Enter quantity"
                  value={field.value.toString()}
                  onChangeText={(text) => {
                    setAmount(Number(text));
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.amount && (
              <Text variant="caption" style={{ color: red }}>
                Amount is required
              </Text>
            )}
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Input
                  label="Price"
                  placeholder="Enter unit price"
                  value={field.value.toString()}
                  onChangeText={(text) => {
                    setPrice(Number(text));
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.price && (
              <Text variant="caption" style={{ color: red }}>
                Price is required
              </Text>
            )}
            <Controller
              control={control}
              name="unpaidAmount"
              render={({ field }) => (
                <Input
                  label="Unpaid Amount"
                  placeholder="Total in ETB"
                  value={field.value.toString()}
                  onChangeText={(text) => field.onChange(Number(text))}
                  keyboardType="numeric"
                />
              )}
            />

            <BottomSheet
              isVisible={isPartnerBottomSheetVisible}
              onClose={() => setPartnerBottomSheetVisible(false)}
              title=""
              snapPoints={[0.8, 0.8]}
              enableBackdropDismiss={false}
            >
              <View style={{ gap: 20 }}>
                <CreatePartnerForm
                  handleGoBack={() => setPartnerBottomSheetVisible(false)}
                  fromBottom={true}
                  bgColor={secondaryBg}
                />
              </View>
            </BottomSheet>

            <Separator style={{ marginVertical: 15 }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Text variant="title" style={{ fontSize: 18, color: primary }}>
                Line Total:
              </Text>
              <Text
                variant="title"
                style={{ fontSize: 18, fontWeight: "bold", color: primary }}
              >
                {lineTotal} ETB
              </Text>
            </View>
            <Separator style={{ marginVertical: 15 }} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Order"
                : "Create Order"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditOrder;
