import React, { useState } from "react";
import { router } from "expo-router";
import { FlatList } from "react-native";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/searchbar";
import { ScrollView } from "@/components/ui/scroll-view";
import { useDebounce } from "@uidotdev/usehooks";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useColor } from "@/hooks/useColor";
import { Plus } from "lucide-react-native";
import ItemCard from "@/components/ItemCard";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteItem, getAllItems } from "@/service/item";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

const Items = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 300);

  const bgColor = useColor("background");
  const red = useColor("red");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

  const filters = ["All", "KG", "Item", "Lt"];

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["items", filter, debouncedSearchTerm],
    queryFn: () => getAllItems(1, search, filter),
  });

  const handleEditItem = (itemId: string) => {
    router.push(`/editItem/${itemId}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(Number(itemId));
    queryClient.invalidateQueries({ queryKey: ["items"] });
    toast({
      title: "Deletion successful",
      variant: "success",
    });
  };

  // Centralized header component
  const renderHeader = () => (
    <View>
      <View style={{ padding: 16, paddingBottom: 8, paddingTop: 5 }}>
        <Text
          variant="title"
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: textColor,
            marginBottom: 8,
          }}
        >
          Items
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          Manage your products and inventory
        </Text>
      </View>

      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search items..."
          value={search}
          onChangeText={setSearch}
          showClearButton={true}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 5,
          marginBottom: 18,
          height: 50,
        }}
        contentContainerStyle={{ gap: 8 }}
      >
        {filters.map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "default" : "outline"}
            size="sm"
            onPress={() => setFilter(filterOption)}
            style={{ minWidth: 80 }}
          >
            {filterOption}
          </Button>
        ))}
      </ScrollView>
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
          <Spinner size="default" variant="dots" label="Fetching Items" />
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
          <Text variant="caption">{"No items found"}</Text>
        </View>
      );
    }

    if (data) {
      return (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ItemCard
              item={{
                id: item.id,
                name: item.item_name,
                measure: item.measure,
                purchasePrice: parseFloat(item.purchase_price),
                sellingPrice: parseFloat(item.projected_selling_price),
              }}
              onEdit={() => handleEditItem(item.id)}
              onDelete={() => {
                toast({
                  title: `Are you sure you want to delete ${item.item_name}`,
                  duration:10000,
                  description:
                    "The item record will still be kept but won't appear in your lists",
                  variant: "warning",
                  action: {
                    label: "Delete",
                    onPress: async () => {
                      try {
                        await handleDeleteItem(item.id);
                      } catch (error) {
                        toast({
                          title: "Error deleting item",
                          description: "Something went wrong",
                          variant: "error",
                        })
                      }
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
            onPress={() => router.push("/editItem/new")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Items;
