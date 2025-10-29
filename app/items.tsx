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
import { Spinner, LoadingOverlay } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";

const Items = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalId, setModalId] = useState(0);
  const dialog = useAlertDialog();
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

  const handleDeleteItem = (itemId: string) => {
    setModalId(Number(itemId));
    dialog.open();
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteItem(modalId);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast({
        title: "Deletion successful",
        variant: "success",
      });
      dialog.close();
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: "Something went wrong",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
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
              onDelete={() => handleDeleteItem(item.id)}
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
      <AlertDialog
        isVisible={dialog.isVisible}
        onClose={dialog.close}
        title="Are you sure you want to delete this item?"
        description="The item record will still be kept but won't appear in your lists."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={() => {
          setLoading(true);
          confirmDelete();
        }}
        onCancel={dialog.close}
      />
      <LoadingOverlay
        visible={loading}
        size="sm"
        variant="cirlce"
        label="Processing..."
        backdrop={true}
        backdropOpacity={0.7}
      />
    </SafeAreaView>
  );
};

export default Items;
