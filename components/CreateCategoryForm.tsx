import { TouchableOpacity, View } from "react-native";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useColor } from "@/hooks/useColor";
import { ArrowLeft } from "lucide-react-native";
import { Separator } from "./ui/separator";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCategory } from "@/service/category";
import { useToast } from "./ui/toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
});

type FormSchemaValues = z.infer<typeof formSchema>;

interface CategoryCreation {
  handleGoBack: () => void;
  fromBottom: boolean;
  bgColor: string;
}

const CreateCategoryForm = ({
  handleGoBack,
  fromBottom,
  bgColor,
}: CategoryCreation) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const textColor = useColor("text");
  const red = useColor("red");
  const { toast } = useToast();

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      await createCategory({
        category_name: data.categoryName,
        business_id: 1, // Replace with actual business ID from context/auth
      });
      
      // Invalidate queries to refresh category lists
      queryClient.invalidateQueries({ queryKey: ["editCategoryTransactionData"] });
      
      toast({
        title: "Success!",
        description: "Category created successfully",
        variant: "success",
      });
      handleGoBack();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Couldn't save category, something went wrong",
        variant: "error",
      });
      console.error("Error saving category:", error);
    }
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
            Create Category
          </Text>
        </View>

        <View
          style={{ padding: 10, flexDirection: "column", gap: 10, flex: 1 }}
        >
          <Separator style={{ marginVertical: 15 }} />

          <Controller
            control={control}
            name="categoryName"
            render={({ field }) => (
              <>
                <Input
                  variant="outline"
                  label="Category Name"
                  placeholder="Electronics"
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {errors.categoryName && (
                  <Text style={{ color: red, marginTop: -5 }}>
                    {errors.categoryName.message}
                  </Text>
                )}
              </>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Submit"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateCategoryForm;
