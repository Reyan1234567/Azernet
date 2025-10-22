import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
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
import { getListOfItems, getListOfPartners } from "@/service/transaction";
import CreateItemForm from "@/components/CreateItemForm";
import CreatePartnerForm from "@/components/CreatePartnerForm";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchase } from "@/service/purchase";
import { sell } from "@/service/sale";

const CreatePurchaseOrSale = () => {
  const [numberOfItems, setNumberOfItems] = useState(0);
  const [price, setPrice] = useState(0);
  const zero = 0;

  const lineTotal =
    numberOfItems && price
      ? (numberOfItems * price).toFixed(2)
      : zero.toFixed(2);
  const formSchema = z
    .object({
      item: z
        .number({ required_error: "Item must be a number" })
        .min(1, "Choose a valid item"),
      partner: z.number({ required_error: "Type must be a number" }).optional(),
      numberOfItems: z
        .number({ required_error: "Type must be a number" })
        .min(1, "Fill in a valid number of Items"),
      price: z
        .number({ required_error: "Type must be a number" })
        .min(1, "Fill in a valid price"),
      unpaidAmount: z.number({ required_error: "Type must be a number" }),
    })
    .refine((data) => data.unpaidAmount <= Number(lineTotal), {
      message: "Unpaid amount can't be greater than the Line Total",
      path: ["unpaidAmount"],
    });

  type FormData = z.infer<typeof formSchema>;
  const { toast } = useToast();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const typeParam = params.type?.toString().toLowerCase();
  const isPurchase = typeParam === "purchase";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: 0,
      partner: 0,
      numberOfItems: 0,
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

  // One unified useQuery to fetch all data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["createPurchase"],
    queryFn: async () => {
      const [items, partners] = await Promise.all([
        getListOfItems(1),
        getListOfPartners(1),
      ]);
      return { items, partners };
    },
  });

  const handleOpenItemBottomSheet = () => {
    setItemComboboxKey((prev) => prev + 1);
    setItemBottomSheetVisible(true);
  };

  const handleOpenPartnerBottomSheet = () => {
    setPartnerComboboxKey((prev) => prev + 1);
    setPartnerBottomSheetVisible(true);
  };

  const secondaryBg = useColor("card");

  const onSubmit = async (formData: FormData) => {
    try {
      if (isPurchase) {
        await purchase({
          itemId: formData.item,
          partnerId: formData.partner || 0,
          numberOfItems: formData.numberOfItems,
          pricePerItem: formData.price,
          unpaidAmount: formData.unpaidAmount,
        });
        toast({
          title: "Purchase record created successfully",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["purchaseTransactions"] });
      } else {
        await sell(
          formData.item,
          formData.partner,
          formData.price,
          formData.numberOfItems,
          formData.unpaidAmount
        );
        toast({
          title: "Sale record created successfully",
          variant: "success",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["salesTransactions"] });

      router.back();
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: e.message,
          variant: "error",
        });
      } else {
        toast({
          title: "An unknown error occurred.",
          variant: "error",
        });
      }
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
          <Spinner size="default" variant="dots" label="Loading..." />
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
            {error?.message ?? "Connect to the internet and try again!"}
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
              fontSize: 20,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {isPurchase ? "Create Purchase" : "Create Sale"}
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
              <Text style={{ color: red, fontSize: 14 }}>
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
              name="numberOfItems"
              render={({ field }) => (
                <Input
                  label="Number of Items"
                  placeholder="Enter quantity"
                  value={field.value.toString()}
                  onChangeText={(text) => {
                    text = text.trim().replace(/\D/g, "");
                    setNumberOfItems(Number(text));
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.numberOfItems && (
              <Text variant="caption" style={{ color: red, fontSize: 14 }}>
                {errors.numberOfItems.message}
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
                    text = text.trim().replace(/\D/g, "");
                    setPrice(Number(text));
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.price && (
              <Text variant="caption" style={{ color: red, fontSize: 14 }}>
                Price is required
              </Text>
            )}
            <Controller
              control={control}
              name="unpaidAmount"
              render={({ field }) => (
                <Input
                  label="Unpaid numberOfItems"
                  placeholder="Total in ETB"
                  value={field.value.toString()}
                  onChangeText={(text) => {
                    text = text.trim().replace(/\D/g, "");
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                  error={errors.unpaidAmount?.message}
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

            <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
              {isPurchase ? "Create Purchase" : "Create Sale"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreatePurchaseOrSale;
