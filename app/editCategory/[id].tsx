import { View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColor } from "@/hooks/useColor";
import { ArrowLeft } from "lucide-react-native";
import { createCategory, editCategory, getAsingleCategory } from "@/service/category";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

const formSchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
});

type FormSchemaValues = z.infer<typeof formSchema>;

const CategoryForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.id as string;
  const isEditMode = categoryId && categoryId !== "new";

  const bgColor = useColor("background");
  const textColor = useColor("text");
  const red = useColor("red");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Fetch category data with useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getAsingleCategory(Number(categoryId)),
    enabled: isEditMode && !!categoryId,
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (isEditMode && data) {
      reset({
        categoryName: data.category_name,
      });
    }
  }, [isEditMode, data, reset]);

  const onSubmit = async (data: FormSchemaValues) => {
    try {
      if (isEditMode) {
        await editCategory({
          id: Number(categoryId),
          category_name: data.categoryName,
          business_id: 1, // Replace with actual business ID from context
        });
        toast({
          title: "Success!",
          description: "Category has been updated.",
          variant: "success",
        });
      } else {
        await createCategory({
          category_name: data.categoryName,
          business_id: 1, // Replace with actual business ID from context
        });
        toast({
          title: "Success!",
          description: "Category created successfully",
          variant: "success",
        });
      }
      router.back();
    } catch (error) {
      toast({
        title: "Error!",
        description: "Couldn't save category, something went wrong",
        variant: "error",
      });
      console.error("Error saving category:", error);
    }
    finally{
      queryClient.invalidateQueries({queryKey: ["categories"]})
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
          <Spinner size="default" variant="dots" label="Loading category..." />
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
            {error?.message ?? "Failed to load category"}
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
            {isEditMode ? "Edit Category" : "Create Category"}
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
                    label="Category Name"
                    placeholder="Electronics, Clothing, etc."
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!errors.categoryName}
                  />
                  {errors.categoryName && (
                    <Text style={{ color: "red", marginTop: -5 }}>
                      {errors.categoryName.message}
                    </Text>
                  )}
              </>
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Category"
              : "Create Category"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CategoryForm;
