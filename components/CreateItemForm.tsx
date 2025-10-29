import { View } from "react-native";
import { Text } from "../components/ui/text";
import { Button } from "../components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import { useColor } from "@/hooks/useColor";
import { Spinner } from "./ui/spinner";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Picker } from "./ui/picker";
import { createItem, editItem, getAsingleItem } from "@/service/item";
import { useToast } from "./ui/toast";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
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
      measure: "",
      description: "",
    },
  });
  const queryClient =useQueryClient();
  const MeasureOptions = [
    { value: "Item", label: "Item" },
    { value: "KG", label: "KG" },
    { value: "Lt", label: "Lt" },
  ];

  const textColor = useColor("text");
  const red = useColor("red");
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getAsingleItem(Number(itemId)),
    enabled: !!isEditMode && !!itemId && itemId !== "new",
    staleTime: 0,
  });

  useEffect(() => {
    console.log("useEffect...");
    console.log("useEffect...");

    if (isEditMode && data) {
      reset({
        itemName: data.item_name,
        measure: data.measure,
        description: data.description,
      });
    }
  }, [isEditMode, data, reset]);

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      console.log("am i even in the correct thign???");
      if (isEditMode) {
        await editItem({
          id: Number(itemId),
          item_name: data.itemName,
          measure: data.measure,
          description: data.description || "",
          business_id: 1,
        });
        toast({
          title: "Success!",
          description: "Item info has been updated.",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["items"] });
        console.log("Code reach test for edit");
        queryClient.invalidateQueries({
          queryKey: ["createPurchaseOrSale"],
        });
        handleGoBack();
      } else {
        await createItem({
          item_name: data.itemName,
          measure: data.measure,
          description: data.description || "",
          business_id: 1,
        });
        console.log("Code reach test for create");
        queryClient.invalidateQueries({ queryKey: ["items"] });
        queryClient.invalidateQueries({
          queryKey: ["createPurchaseOrSale"],
        });
        handleGoBack();
        toast({
          title: "Success!",
          description: "Item created successfully",
          variant: "success",
        });
      }
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
              fontSize: 25,
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
                  error={errors.itemName?.message}
                />
              </>
            )}
          />
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
                  error={errors.measure?.message}
                />
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
