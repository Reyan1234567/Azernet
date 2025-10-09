import { TouchableOpacity, View } from "react-native";
import { Text } from "../components/ui/text";
import { Button } from "../components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import { useColor } from "@/hooks/useColor";
import { ArrowLeft } from "lucide-react-native";
import { Spinner } from "./ui/spinner";
import { Separator } from "./ui/separator";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Picker } from "./ui/picker";
import { createItem, editItem, getAsingleItem } from "@/service/item";
import { useToast } from "./ui/toast";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  purchasePrice: z
    .number({ invalid_type_error: "Purchase price is required" })
    .positive("Price must be greater than zero"),
  sellingPrice: z
    .number({ invalid_type_error: "Selling price is required" })
    .positive("Selling must be greater than zero"),
  measure: z.string().min(1, "Measurement is required"),
  description: z.string().optional(),
});

type FormSchemaValues = z.infer<typeof formSchema>;

interface itemCreation {
  isEditMode: boolean | "";
  handleGoBack: () => void;
  itemId: string;
  fromBottom: boolean;
  bgColor: string;
}
const CreateItemForm = ({
  isEditMode,
  handleGoBack,
  itemId,
  fromBottom,
  bgColor,
}: itemCreation) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      purchasePrice: 0,
      sellingPrice: 0,
      measure: "",
      description: "",
    },
  });

  const MeasureOptions = [
    { value: "Item", label: "Item" },
    { value: "KG", label: "KG" },
    { value: "Lt", label: "Lt" },
  ];

  //   const bgColor = useColor("background");
  const textColor = useColor("text");
  const red = useColor("red");
  const { toast } = useToast();

  // Fetch item data with useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getAsingleItem(Number(itemId)),
    enabled: !!isEditMode && !!itemId && itemId !== "new",
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (isEditMode && data) {
      reset({
        itemName: data.item_name,
        purchasePrice: data.purchase_price,
        sellingPrice: data.projected_selling_price,
        measure: data.measure,
        description: data.description,
      });
    }
  }, [isEditMode, data, reset]);

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      if (isEditMode) {
        await editItem({
          id: Number(itemId),
          item_name: data.itemName,
          purchase_price: data.purchasePrice || 0,
          projected_selling_price: data.sellingPrice || 0,
          measure: data.measure,
          description: data.description || "",
        });
        toast({
          title: "Success!",
          description: "Item info has been updated.",
          variant: "success",
        });
      } else {
        await createItem({
          item_name: data.itemName,
          purchase_price: data.purchasePrice || 0,
          projected_selling_price: data.sellingPrice || 0,
          measure: data.measure,
          description: data.description || "",
        });
        toast({
          title: "Success!",
          description: "Item created successfully",
          variant: "success",
        });
      }
      handleGoBack()
    } catch (error) {
      toast({
        title: "Error!",
        description: "Couldn't save item, something went wrong",
        variant: "error",
      });
      console.error("Error saving item:", error);
    }
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
          <Spinner size="default" variant="dots" label="Loading item..." />
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
            {error?.message ?? "Failed to load item"}
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
          {!fromBottom && (
            <TouchableOpacity
              onPress={handleGoBack}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text
            variant="title"
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {isEditMode ? "Edit Item" : "Create Item"}
          </Text>
        </View>

        <View
          style={{ padding: 10, flexDirection: "column", gap: 10, flex: 1 }}
        >
          <Separator style={{ marginVertical: 15 }} />

          <Controller
            control={control}
            name="itemName"
            render={({ field }) => (
              <>
                <Input
                  variant="outline"
                  label="Item Name"
                  placeholder="Samsung A36"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={!!errors.itemName}
                />
                {errors.itemName && (
                  <Text style={{ color: "red", marginTop: -5 }}>
                    {errors.itemName.message}
                  </Text>
                )}
              </>
            )}
          />

          <View style={{ flexDirection: "column", gap: 10 }}>
            <Controller
              control={control}
              name="purchasePrice"
              render={({ field }) => (
                <>
                  <Input
                    variant="outline"
                    label="Purchase price"
                    placeholder="1000 ETB"
                    value={field.value.toString()}
                    onChangeText={(text) => {
                      const numericValue =
                        text === "" ? undefined : Number(text);
                      field.onChange(numericValue);
                    }}
                    keyboardType="numeric"
                    error={!!errors.purchasePrice}
                  />
                  {errors.purchasePrice && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.purchasePrice.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="sellingPrice"
              render={({ field }) => (
                <>
                  <Input
                    variant="outline"
                    label="Estimated Selling price"
                    placeholder="1500 ETB"
                    value={field.value.toString()}
                    onChangeText={(text) => {
                      const numericValue =
                        text === "" ? undefined : Number(text);
                      field.onChange(numericValue);
                    }}
                    keyboardType="numeric"
                    error={!!errors.sellingPrice}
                  />
                  {errors.sellingPrice && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.sellingPrice.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <Controller
            control={control}
            name="measure"
            render={({ field }) => (
              <>
                <Picker
                  variant="outline"
                  label="Measurement"
                  options={MeasureOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select the measurement"
                />
                {errors.measure && (
                  <Text style={{ color: "red", marginTop: -5 }}>
                    {errors.measure.message}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Input
                variant="outline"
                label="Description (Optional)"
                placeholder="Additional details about the item"
                value={field.value}
                onChangeText={field.onChange}
                type="textarea"
              />
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Item"
              : "Submit"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateItemForm;
