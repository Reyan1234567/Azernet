import React, { useState } from "react";
import { router } from "expo-router";
import { FlatList } from "react-native";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/searchbar";
import { useDebounce } from "@uidotdev/usehooks";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useColor } from "@/hooks/useColor";
import { Plus } from "lucide-react-native";
import CategoryCard from "@/components/CategoryCard";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteCategory, getAllCategories } from "@/service/category";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

const Categories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);

  const bgColor = useColor("background");
  const red = useColor("red");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["categories", debouncedSearchTerm],
    queryFn: () => getAllCategories(1, search),
  });

  const handleEditCategory = (categoryId: string) => {
    router.push(`/editCategory/${categoryId}`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(Number(categoryId));
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    toast({
      title: "Deletion successful",
      variant: "success",
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  // Centralized header component
  const renderHeader = () => (
    <View>
      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          paddingBottom: 8,
          paddingTop: 5,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            variant="title"
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: textColor,
              marginBottom: 8,
            }}
          >
            Categories
          </Text>
          <Text variant="body" style={{ color: mutedColor }}>
            Manage your product categories
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search categories..."
          value={search}
          onChangeText={setSearch}
          showClearButton={true}
        />
      </View>
    </View>
  );

  // Centralized content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Spinner size="default" variant="dots" label="Fetching Categories" />
        </View>
      );
    }

    if (isError) {
      return (
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text style={{ color: red }}>
            {error.message ?? "Something went wrong"}
          </Text>
        </View>
      );
    }

    if (isSuccess && data.length === 0) {
      return (
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text variant="caption">{"No categories found"}</Text>
        </View>
      );
    }

    if (data) {
      return (
        <FlatList
          data={data}
          keyExtractor={(category) => category.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <CategoryCard
              category={{
                id: item.id,
                name: item.category_name,
                createdAt: item.created_at,
              }}
              onEdit={() => handleEditCategory(item.id)}
              onDelete={() => {
                toast({
                  title: `Are you sure you want to delete ${item.category_name}?`,
                  description:
                    "This action cannot be undone. All items in this category will be uncategorized.",
                  variant: "warning",
                  action: {
                    label: "Delete",
                    onPress: () => {
                      handleDeleteCategory(item.id);
                    },
                  },
                });
              }}
            />
          )}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1, backgroundColor: bgColor, paddingTop: 24 }}>
        {renderHeader()}
        {renderContent()}
        <View
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Button
            variant="default"
            size="lg"
            icon={Plus}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: primaryColor,
            }}
            onPress={() => router.push("/editCategory/new")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Categories;