import { View, ScrollView } from "react-native";
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
import CreatePartnerForm from "@/components/CreatePartnerForm";
import { useRouter } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/service/orders";

const formSchema = z.object({
  partner: z
    .number({ required_error: "Partner must be a number" })
    .min(1, "Select a partner"),
  item: z
    .number({ required_error: "Item must be a number" })
    .min(1, "Select an item"),
  description: z.string().min(1, "Add some description about the order"),
  number_of_items: z
    .number({ required_error: "Number of items must be a number" })
    .min(1, "Enter a valid quantity"),
});

type FormData = z.infer<typeof formSchema>;

const CreateOrder = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partner: 0,
      item: 0,
      description: "",
      number_of_items: 0,
    },
  });

  const primary = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("text");
  const bgColor = useColor("background");
  const [selectedPartner, setSelectedPartner] = useState<OptionType | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<OptionType | null>(null);
  const [isPartnerBottomSheetVisible, setPartnerBottomSheetVisible] =
    useState(false);
  const [isItemBottomSheetVisible, setItemBottomSheetVisible] = useState(false);
  const [partnerComboboxKey, setPartnerComboboxKey] = useState(0);
  const [itemComboboxKey, setItemComboboxKey] = useState(0);

  // Fetch partners and items data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["partnersAndItemsData"],
    queryFn: async () => {
      const partners = await getListOfPartners(1);
      const items = await getListOfItems(1); // Make sure you have this function
      return { partners, items };
    },
  });

  const handleOpenPartnerBottomSheet = () => {
    setPartnerComboboxKey((prev) => prev + 1);
    setPartnerBottomSheetVisible(true);
  };

  const handleOpenItemBottomSheet = () => {
    setItemComboboxKey((prev) => prev + 1);
    setItemBottomSheetVisible(true);
  };

  const secondaryBg = useColor("card");

  const onSubmit = async (formData: FormData) => {
    try {
      await createOrder(
        formData.item,
        formData.partner,
        formData.description,
        formData.number_of_items
      );
      toast({
        title: "Order created successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["orders", "purchases", "sales"] });
      router.back();
    } catch (e) {
      toast({
        title: "Failed to create order",
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
            label="Loading partners & items..."
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
            {error?.message ?? "Failed to load partners or items"}
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
            Create Order
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
                  error={errors.description?.message}
                />
              )}
            />
            {/* {errors.description && (
              <Text variant="caption" style={{ color: red }}>
                {errors.description.message}
              </Text>
            )} */}

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
                  <ComboboxTrigger error={!!errors.partner}>
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
            {errors.partner && (
              <Text
                variant="caption"
                style={{
                  color: red,
                  fontSize: 15,
                  marginLeft: 15,
                  marginTop: -15,
                }}
              >
                {errors.partner.message}
              </Text>
            )}
            <Controller
              control={control}
              name="item"
              render={({ field }) => (
                <Combobox
                  key={itemComboboxKey}
                  value={selectedItem}
                  onValueChange={(option) => {
                    setSelectedItem(option);
                    field.onChange(Number(option?.value));
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
                          No item found. Create new
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
              <Text
                variant="caption"
                style={{
                  color: red,
                  fontSize: 15,
                  marginLeft: 15,
                  marginTop: -15,
                }}
              >
                {errors.item.message}
              </Text>
            )}
            <Controller
              control={control}
              name="number_of_items"
              render={({ field }) => (
                <Input
                  label="Quantity"
                  placeholder="Enter quantity"
                  value={field.value.toString()}
                  onChangeText={(text) => {
                    text = text.trim().replace(/\D/g, "");
                    field.onChange(Number(text));
                  }}
                  keyboardType="numeric"
                  error={errors.number_of_items?.message}
                />
              )}
            />
            {/* {errors.number_of_items && (
              <Text variant="caption" style={{ color: red }}>
                {errors.number_of_items.message}
              </Text>
            )} */}

            {/* Partner BottomSheet */}
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

            {/* Item BottomSheet */}
            <BottomSheet
              isVisible={isItemBottomSheetVisible}
              onClose={() => setItemBottomSheetVisible(false)}
              title=""
              snapPoints={[0.8, 0.8]}
              enableBackdropDismiss={false}
            >
              <View style={{ gap: 20 }}>
                {/* You can add your CreateItemForm here if you have one */}
                <Text style={{ color: textColor }}>
                  Create new item form goes here.
                </Text>
              </View>
            </BottomSheet>

            <Separator style={{ marginVertical: 15 }} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreateOrder;
