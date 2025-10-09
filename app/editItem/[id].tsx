// import { View, TouchableOpacity } from "react-native";
import React from "react";
// import { Input } from "@/components/ui/input";
// import { Picker } from "@/components/ui/picker";
// import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
// import { Separator } from "@/components/ui/separator";
import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
import { useColor } from "@/hooks/useColor";
// import { ArrowLeft } from "lucide-react-native";
// import { createItem, editItem, getAsingleItem } from "@/service/item";
// import { useToast } from "@/components/ui/toast";
// import { Spinner } from "@/components/ui/spinner";

// import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Controller, useForm } from "react-hook-form";
import CreateItemForm from "@/components/CreateItemForm";
import { ArrowLeft, View } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// const formSchema = z.object({
//   itemName: z.string().min(1, "Item name is required"),
//   purchasePrice: z
//     .number({ invalid_type_error: "Purchase price is required" })
//     .positive("Price must be greater than zero"),
//   sellingPrice: z
//     .number({ invalid_type_error: "Selling price is required" })
//     .positive("Selling must be greater than zero"),
//   measure: z.string().min(1, "Measurement is required"),
//   description: z.string().optional(),
// });

// type FormSchemaValues = z.infer<typeof formSchema>;

const ItemForm = () => {
  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { errors, isSubmitting },
  // } = useForm<FormSchemaValues>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     itemName: "",
  //     purchasePrice: 0,
  //     sellingPrice: 0,
  //     measure: "",
  //     description: "",
  //   },
  // });

  const router = useRouter();
  const params = useLocalSearchParams();
  const itemId = params.id as string;
  // const [isLoading, setIsLoading] = useState(false);
  const isEditMode = itemId && itemId !== "new";

  const bgColor = useColor("background");
  const textColor = useColor("text");

  // const MeasureOptions = [
  //   { value: "Item", label: "Item" },
  //   { value: "KG", label: "KG" },
  //   { value: "Lt", label: "Lt" },
  // ];

  // const { toast } = useToast();

  // useLayoutEffect(() => {
  //   if (isEditMode) {
  //     const getItem = async () => {
  //       try {
  //         setIsLoading(true);
  //         const res = await getAsingleItem(Number(itemId));
  //         reset({
  //           itemName: res.item_name,
  //           purchasePrice: res.purchase_price,
  //           sellingPrice: res.projected_selling_price,
  //           measure: res.measure,
  //           description: res.description,
  //         });
  //       } catch (e) {
  //         reset({
  //           itemName: "",
  //           purchasePrice: 0,
  //           sellingPrice: 0,
  //           measure: "",
  //           description: "",
  //         });
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };
  //     getItem();
  //   }
  // }, [isEditMode, itemId, reset]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* <View style={{ flex: 1 }}>
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
            {isEditMode ? "Edit Item" : "Create Item"}
          </Text>
        </View>
      </View> */}
      <CreateItemForm isEditMode={isEditMode} handleGoBack={handleGoBack} itemId={itemId} fromBottom={false} bgColor={bgColor}/>
    </SafeAreaView>
  );
};

export default ItemForm;
{
  /* //     {isLoading ? ( 
    //       <View
    //         style={{
    //           width: "100%",
    //           display: "flex",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           flex: 1,
    //         }}
    //       >
    //         <Spinner size="default" variant="dots" label="Fetching info" />
    //       </View>
    //     ) : (
    //       <View
    //         style={{ padding: 10, flexDirection: "column", gap: 10, flex: 1 }}
    //       >
    //         <Separator style={{ marginVertical: 15 }} />

    //         <Controller
    //           control={control}
    //           name="itemName"
    //           render={({ field }) => (
    //             <>
    //               <Input
    //                 label="Item Name"
    //                 placeholder="Samsung A36"
    //                 value={field.value}
    //                 onChangeText={field.onChange}
    //                 error={!!errors.itemName}
    //               />
    //               {errors.itemName && (
    //                 <Text style={{ color: "red", marginTop: -5 }}>
    //                   {errors.itemName.message}
    //                 </Text>
    //               )}
    //             </>
    //           )}
    //         />

    //         <View style={{ flexDirection: "column", gap: 10 }}>
    //           <Controller
    //             control={control}
    //             name="purchasePrice"
    //             render={({ field }) => (
    //               <>
    //                 <Input
    //                   label="Purchase price"
    //                   placeholder="1000 ETB"
    //                   value={field.value.toString()}
    //                   onChangeText={(text) => {
    //                     const numericValue =
    //                       text === "" ? undefined : Number(text);
    //                     field.onChange(numericValue);
    //                   }}
    //                   keyboardType="numeric"
    //                   error={!!errors.purchasePrice}
    //                 />
    //                 {errors.purchasePrice && (
    //                   <Text style={{ color: "red", marginTop: -5 }}>
    //                     {errors.purchasePrice.message}
    //                   </Text>
    //                 )}
    //               </>
    //             )}
    //           />

    //           <Controller
    //             control={control}
    //             name="sellingPrice"
    //             render={({ field }) => (
    //               <>
    //                 <Input
    //                   label="Estimated Selling price"
    //                   placeholder="1500 ETB"
    //                   value={field.value.toString()}
    //                   onChangeText={(text) => {
    //                     const numericValue =
    //                       text === "" ? undefined : Number(text);
    //                     field.onChange(numericValue);
    //                   }}
    //                   keyboardType="numeric"
    //                   error={!!errors.sellingPrice}
    //                 />
    //                 {errors.sellingPrice && (
    //                   <Text style={{ color: "red", marginTop: -5 }}>
    //                     {errors.sellingPrice.message}
    //                   </Text>
    //                 )}
    //               </>
    //             )}
    //           />
    //         </View>

    //         <Controller
    //           control={control}
    //           name="measure"
    //           render={({ field }) => (
    //             <>
    //               <Picker
    //                 label="Measurement"
    //                 options={MeasureOptions}
    //                 value={field.value}
    //                 onValueChange={field.onChange}
    //                 placeholder="Select the measurement"
    //               />
    //               {errors.measure && (
    //                 <Text style={{ color: "red", marginTop: -5 }}>
    //                   {errors.measure.message}
    //                 </Text>
    //               )}
    //             </>
    //           )}
    //         />

    //         <Controller
    //           control={control}
    //           name="description"
    //           render={({ field }) => (
    //             <Input
    //               label="Description (Optional)"
    //               placeholder="Additional details about the item"
    //               value={field.value}
    //               onChangeText={field.onChange}
    //               type="textarea"
    //             />
    //           )}
    //         />

    //         <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
    //           {isSubmitting
    //             ? isEditMode
    //               ? "Updating..."
    //               : "Creating..."
    //             : isEditMode
    //             ? "Update Item"
    //             : "Submit"}
    //         </Button>
    //       </View>
    //     )}
    //   </View>
    </SafeAreaView>)*/
}
