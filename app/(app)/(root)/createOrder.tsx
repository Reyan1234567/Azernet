import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React, { useState, useContext } from "react";
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
import CreateItemForm from "@/components/CreateItemForm";
import { useRouter } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/service/orders";
import { useBusiness } from "@/context/businessContext";
import SnackBarToast from "@/components/SnackBarToast";

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
  const queryClient = useQueryClient();
  const BUSINESS = useBusiness();

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

  // Fetch partners and items data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["createPurchaseOrSale", BUSINESS?.businessId],
    queryFn: async () => {
      const [items, partners] = await Promise.all([
        getListOfItems(BUSINESS?.businessId),
        getListOfPartners(BUSINESS?.businessId),
      ]);
      return { items, partners };
    },
  });

  const handleOpenPartnerBottomSheet = () => {
    Keyboard.dismiss();
    setPartnerBottomSheetVisible(true);
  };

  const handleOpenItemBottomSheet = () => {
    Keyboard.dismiss();
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
      // toast({
      //   title: "Order created successfully",
      //   variant: "success",
      // });
      SnackBarToast({
        message: "Order created successfully",
        isSuccess: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["purchases"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });
      router.back();
    } catch (e: unknown) {
      if (e instanceof Error) {
        // toast({
        //   title: e.message,
        //   variant: "error",
        // });
        SnackBarToast({
          message: e.message,
          isSuccess: false,
        });
      } else {
        // toast({
        //   title: "Failed to create order",
        //   variant: "error",
        // });
        SnackBarToast({
          message: "Failed to create order",
          isSuccess: false,
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
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
          style={{ paddingHorizontal: 15 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Separator style={{ marginVertical: 15 }} />
          <View style={{ flexDirection: "column", gap: 15 }}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  label="Description"
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

            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
            >
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="partner"
                  render={({ field }) => (
                    <Combobox
                      key={2}
                      value={selectedPartner}
                      onValueChange={(option) => {
                        setSelectedPartner(option);
                        field.onChange(Number(option?.value));
                      }}
                    >
                      <ComboboxTrigger error={errors.partner?.message}>
                        <ComboboxValue placeholder="Select partner" />
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput
                          style={{ height: 70 }}
                          placeholder="Search partners..."
                          error={errors.partner?.message}
                        />
                        <ComboboxList>
                          <ComboboxEmpty>
                            <Text variant="caption">Nothing was found!</Text>
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
              </View>
              <Button
                onPress={handleOpenPartnerBottomSheet}
                style={{ minWidth: 50, paddingHorizontal: 12 }}
              >
                +
              </Button>
            </View>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
            >
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="item"
                  render={({ field }) => (
                    <Combobox
                      key={1}
                      value={selectedItem}
                      onValueChange={(option) => {
                        field.onChange(Number(option?.value));
                        setSelectedItem(option);
                      }}
                    >
                      <ComboboxTrigger error={errors.item?.message}>
                        <ComboboxValue placeholder="Select item..." />
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput
                          style={{ height: 70 }}
                          placeholder="Search Items..."
                          error={errors.item?.message}
                        />
                        <ComboboxList>
                          <ComboboxEmpty>
                            <Text
                              style={{ textAlign: "center", padding: 10 }}
                              variant="caption"
                            >
                              Nothing was found!
                            </Text>
                          </ComboboxEmpty>
                          {data?.items.map((item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item.id.toString()}
                            >
                              {item.item_name}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
              </View>
              <Button
                onPress={handleOpenItemBottomSheet}
                style={{ minWidth: 50, paddingHorizontal: 12 }}
              >
                +
              </Button>
            </View>
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

            <BottomSheet
              isVisible={isItemBottomSheetVisible}
              onClose={() => setItemBottomSheetVisible(false)}
              snapPoints={[0.9, 0.9]}
              enableBackdropDismiss={true}
            >
              <KeyboardAvoidingView style={{ gap: 20 }}>
                <CreateItemForm
                  isEditMode={false}
                  handleGoBack={() => setItemBottomSheetVisible(false)}
                  itemId={"new"}
                  bgColor={secondaryBg}
                />
              </KeyboardAvoidingView>
            </BottomSheet>

            <BottomSheet
              isVisible={isPartnerBottomSheetVisible}
              onClose={() => setPartnerBottomSheetVisible(false)}
              title=""
              snapPoints={[0.5, 0.9]}
              enableBackdropDismiss={true}
            >
              <KeyboardAvoidingView style={{ gap: 20 }}>
                <CreatePartnerForm
                  handleGoBack={() => setPartnerBottomSheetVisible(false)}
                  bgColor={secondaryBg}
                />
              </KeyboardAvoidingView>
            </BottomSheet>

            <Separator style={{ marginVertical: 15 }} />

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateOrder;
