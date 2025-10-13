import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { useToast } from "@/components/ui/toast";
import CreateItem from "./createItem";
import CreatePartner from "./createPartner";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spinner } from "@/components/ui/spinner";

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

type notOneTime = z.infer<typeof formSchema>;

const CreateItemTransaction = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionId = params.id as string;
  const transactionType = params.type as string;
  const isEditMode = transactionId && transactionId !== "new";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<notOneTime>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item: 0,
      partner: 0,
      type: transactionType || "",
      amount: 0,
      price: 0,
      unpaidAmount: 0,
    },
  });

  const [items, setItems] = useState([{ id: 0, item_name: "" }]);
  const [partners, setPartners] = useState([
    { id: 0, first_name: "", last_name: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const primary = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("text");
  const bgColor = useColor("background");
  const [itemObject, setItemObject] = useState({ id: 0, item_name: "" });
  const [itemValue, setItemValue] = useState<OptionType | null>(null);
  const [partnerValue, setPartnerValue] = useState<OptionType | null>(null);
  const [selectedItem, setSelectedItem] = useState<OptionType | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<OptionType | null>(
    null
  );
  const [isItemBottomSheetVisible, setItemBottomSheetVisible] = useState(false);
  const [isPartnerBottomSheetVisible, setPartnerBottomSheetVisible] =
    useState(false);
  const [itemComboboxKey, setItemComboboxKey] = useState(0);
  const [partnerComboboxKey, setPartnerComboboxKey] = useState(0);
  // const [isUnknownCustomer, setIsUnknownCustomer] = useState(false);
  // const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const { toast } = useToast();
  const handleOpenItemBottomSheet = () => {
    // Force Combobox to close by re-rendering it
    setItemComboboxKey((prev) => prev + 1);
    setItemBottomSheetVisible(true);
  };

  const handleOpenPartnerBottomSheet = () => {
    // Force Combobox to close by re-rendering it
    setPartnerComboboxKey((prev) => prev + 1);
    setPartnerBottomSheetVisible(true);
  };

  const transactionTypes: OptionType[] = [
    { value: "Sale", label: "Sale" },
    { value: "Purchase", label: "Purchase" },
  ];

  // Fetch items and partners on mount
  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await getListOfItems(1);
        setItems(res);
      } catch (e) {
        setItems([]);
      }
    };

    const getPartners = async () => {
      try {
        const res = await getListOfPartners(1);
        setPartners(res);
      } catch (e) {
        setPartners([]);
      }
    };

    getItems();
    getPartners();
  }, []);

  // Fetch transaction data if in edit mode
  useLayoutEffect(() => {
    if (isEditMode) {
      const getTransaction = async () => {
        try {
          setIsLoading(true);
          const res = await getSingleItemTransaction(Number(transactionId));
          
          // Reset form with fetched data
          reset({
            item: res.item_id,
            partner: res.partner_id,
            type: res.status,
            amount: res.amount,
            price: res.pricePerItem,
            unpaidAmount: res.unpaidAmount,
          });

          // Set display values for comboboxes
          setSelectedItem({
            value: res.item_id.toString(),
            label: res.item_name,
          });

          setPartnerValue({
            value: res.partner_id,
            label: `${res.partnerFirstname} ${res.partnerFastname}`,
          });

          // Find partner name from partners list after it loads
          setAmount(res.amount);
          setPrice(res.pricePerItem);
        } catch (e) {
          toast({
            title: "Error loading transaction",
            description: "Failed to fetch transaction data",
            variant: "error",
          });
          router.back();
        } finally {
          setIsLoading(false);
        }
      };
      getTransaction();
    }
  }, [isEditMode, transactionId]);

  // Calculate line total
  const lineTotal = amount && price ? (amount * price).toFixed(2) : "0.00";

  const onSubmit = async (data: any) => {
    try {
      await createItemTransaction({ ...data, lineTotal });
      toast({
        title: "Transaction created successfully",
        variant: "success",
      });
      router.back();
    } catch (e) {
      toast({
        title: "Some error happened",
        variant: "error",
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

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

        {isLoading ? (
          <View
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Spinner size="default" variant="dots" label="Loading transaction..." />
          </View>
        ) : (
          <ScrollView style={{ padding: 15 }} showsVerticalScrollIndicator={false}>
        <Separator style={{ marginVertical: 15 }} />
        <View style={{ flexDirection: "column", gap: 15 }}>
          <Controller
            control={control}
            name="item"
            render={({ field }) => (
              <Combobox
                key={itemComboboxKey} // Force re-render when needed
                value={selectedItem} // Display value
                onValueChange={(option) => {
                  field.onChange(Number(option?.value)); // Update form with ID
                  setSelectedItem(option); // Update display
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
                    {items.map((item) => (
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
            <Text style={{ color: "red", fontSize: 12 }}>
              {errors.item.message}
            </Text>
          )}
          <Controller
            control={control}
            name="partner"
            render={({ field }) => (
              <Combobox
                key={partnerComboboxKey}
                value={partnerValue}
                onValueChange={(option) => {
                  setPartnerValue(option);
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
                    {partners.map((partner) => (
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
                  setPrice(Number(text));
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
                  setAmount(Number(text));
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
                label="Amount Amount"
                placeholder="Total in ETB"
                value={field.value.toString()}
                onChangeText={(text) => field.onChange(Number(text))}
                keyboardType="numeric"
              />
            )}
          />
          {errors.amount && (
            <Text variant="caption" style={{ color: red }}>
              Type is required
            </Text>
          )}
          <BottomSheet
            isVisible={isItemBottomSheetVisible}
            onClose={() => setItemBottomSheetVisible(false)}
            title=""
            snapPoints={[0.8, 0.8]}
            enableBackdropDismiss={false}
          >
            <View style={{ gap: 20 }}>
              <CreateItemForm
                isEditMode={false}
                handleGoBack={() => router.back()}
                itemId={"new"}
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
        )}
      </View>
    </SafeAreaView>
  );
};

export default CreateItemTransaction;
