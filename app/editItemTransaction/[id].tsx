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
import { Picker } from "@/components/ui/picker";
import * as z from "zod";
import { useColor } from "@/hooks/useColor";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createItemTransaction,
  getListOfItems,
  getListOfPartners,
  getSingleItemTransaction,
} from "@/service/transaction";
import { ArrowLeft } from "lucide-react-native";
import CreateItemForm from "@/components/CreateItemForm";
import CreatePartner from "../createPartner";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  item: z
    .number({ required_error: "Item must be a number" })
    .min(1, "Choose a valid item"),
  partner: z.number({ required_error: "Type must be a number" }).optional(),
  type: z.string().min(1, "type is required"),
  amount: z
    .number({ required_error: "Type must be a number" })
    .min(1, "Fill in a valid amount"),
  price: z
    .number({ required_error: "Type must be a number" })
    .min(1, "Fill in a valid price"),
  unpaidAmount: z.number({ required_error: "Type must be a number" }),
});

type FormData = z.infer<typeof formSchema>;

const EditItemTransaction = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;
  const isEditMode = transactionId && transactionId !== "new";
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: 0,
      partner: 0,
      type: "",
      amount: 0,
      price: 0,
      unpaidAmount: 0,
    },
  });

  const primary = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("text");
  const bgColor = useColor("background");
  const [selectedItem, setSelectedItem] = useState<OptionType | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<OptionType | null>(
    null
  );
  const [isItemBottomSheetVisible, setItemBottomSheetVisible] = useState(false);
  const [isPartnerBottomSheetVisible, setPartnerBottomSheetVisible] =
    useState(false);
  const [itemComboboxKey, setItemComboboxKey] = useState(0);
  const [partnerComboboxKey, setPartnerComboboxKey] = useState(0);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);

  // One unified useQuery to fetch all data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["editTransactionData", transactionId],
    queryFn: async () => {
      const [items, partners, transaction] = await Promise.all([
        getListOfItems(1),
        getListOfPartners(1),
        isEditMode
          ? getSingleItemTransaction(Number(transactionId))
          : Promise.resolve(null),
      ]);
      return { items, partners, transaction };
    },
    enabled: !!transactionId,
  });

  // Reset form when data is loaded (only in edit mode)
  useEffect(() => {
    if (isEditMode && data?.transaction) {
      const { transaction } = data;

      reset({
        item: transaction.item_id,
        partner: transaction.partner_id,
        type: transaction.status,
        amount: transaction.amount,
        price: transaction.pricePerItem,
        unpaidAmount: transaction.unpaidAmount,
      });

      setSelectedItem({
        value: transaction.item_id.toString(),
        label: transaction.item_name,
      });

      setSelectedPartner({
        value: transaction.partner_id.toString(),
        label: `${transaction.partnerFirstname} ${transaction.partnerFastname}`,
      });

      setAmount(transaction.amount);
      setPrice(transaction.pricePerItem);
    }
  }, [isEditMode, data, reset]);

  const handleOpenItemBottomSheet = () => {
    setItemComboboxKey((prev) => prev + 1);
    setItemBottomSheetVisible(true);
  };

  const handleOpenPartnerBottomSheet = () => {
    setPartnerComboboxKey((prev) => prev + 1);
    setPartnerBottomSheetVisible(true);
  };

  const transactionTypes: OptionType[] = [
    { value: "Sale", label: "Sale" },
    { value: "Purchase", label: "Purchase" },
  ];
  const secondaryBg=useColor("card")
  const lineTotal = amount && price ? (amount * price).toFixed(2) : "0.00";

  const onSubmit = async (formData: FormData) => {
    try {
      await createItemTransaction({
        item: formData.item,
        partner: formData.partner || 0,
        type: formData.type,
        amount: formData.amount,
        price: formData.price,
        unpaidAmount: formData.unpaidAmount,
        lineTotal: Number(lineTotal),
      });
      toast({
        title: isEditMode
          ? "Transaction updated successfully"
          : "Transaction created successfully",
        variant: "success",
      });
      router.back();
    } catch (e) {
      toast({
        title: isEditMode
          ? "Failed to update transaction"
          : "Failed to create transaction",
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
            label="Loading transaction..."
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
            {error?.message ?? "Failed to load transaction"}
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
            {isEditMode ? "Edit Transaction" : "Create Transaction"}
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
              name="item"
              render={({ field }) => (
                <Combobox
                  key={itemComboboxKey}
                  value={selectedItem}
                  onValueChange={(option) => {
                    field.onChange(Number(option?.value));
                    setSelectedItem(option);
                  }}
                >
                  <ComboboxTrigger error={!!errors.item}>
                    <ComboboxValue placeholder="Select item..." />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxInput placeholder="Search items..." />
                    <ComboboxList>
                      <ComboboxEmpty>
                        <Button onPress={handleOpenItemBottomSheet}>
                          Click to Create new Item
                        </Button>
                      </ComboboxEmpty>
                      {data?.items.map((item) => (
                        <ComboboxItem key={item.id} value={item.id.toString()}>
                          {item.item_name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.item && (
              <Text style={{ color: red, fontSize: 12 }}>
                {errors.item.message}
              </Text>
            )}

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
                    <ComboboxValue placeholder="Select partner..." />
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
              name="type"
              render={({ field }) => (
                <Picker
                  options={transactionTypes}
                  value={field.value}
                  label="Type"
                  onValueChange={field.onChange}
                  placeholder="Select Sale or Purchase"
                />
              )}
            />
            {errors.type && (
              <Text variant="caption" style={{ color: red }}>
                Type is required
              </Text>
            )}
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
              isVisible={isItemBottomSheetVisible}
              onClose={() => setItemBottomSheetVisible(false)}
            //   title="Create Item"
              snapPoints={[0.8, 0.8]}
              enableBackdropDismiss={false}
            >
              <View style={{ gap: 20 }}>
                <CreateItemForm
                  isEditMode={false}
                  handleGoBack={() => setItemBottomSheetVisible(false)}
                  itemId={"new"}
                  fromBottom={true}
                  bgColor={secondaryBg}
                />
              </View>
            </BottomSheet>

            <BottomSheet
              isVisible={isPartnerBottomSheetVisible}
              onClose={() => setPartnerBottomSheetVisible(false)}
              title=""
              snapPoints={[0.8, 0.8]}
              enableBackdropDismiss={false}
            >
              <View style={{ gap: 20 }}>
                <CreatePartner />
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
                ? "Update Transaction"
                : "Create Transaction"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditItemTransaction;
