import { FlatList, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSalesTransactions } from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import SalesCard from "./SalesCard";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner, LoadingOverlay } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";
import { reverseSale } from "@/service/reversals";
import { AlertDialog, useAlertDialog } from "./ui/alert-dialog";

const SalesTransaction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalId, setModalId] = useState(0);
  const dialog = useAlertDialog();
  const filters = ["All", "Paid", "Unpaid"];
  const debouncedSearchTerm = useDebounce(search, 300);

  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["salesTransactions", filter, debouncedSearchTerm],
    queryFn: () => getAllSalesTransactions(1, search, filter),
  });

  const handleReverseTransaction = async (transactionId: number) => {
    setLoading(true);
    try {
      await reverseSale(transactionId);
      queryClient.invalidateQueries({ queryKey: ["salesTransactions"] });
      toast({
        title: "Sale reversed successfully",
        variant: "success",
      });
      dialog.close();
    } catch (error: any) {
      toast({
        title: "Failed to reverse sale",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search sales..."
          value={search}
          onChangeText={setSearch}
          showClearButton={true}
        />
      </View>

      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 5,
          marginBottom: 18,
          flexGrow: 0,
        }}
        keyExtractor={(item) => item}
        contentContainerStyle={{ gap: 8, height: 45 }}
        renderItem={({ item }) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            size="sm"
            onPress={() => setFilter(item)}
            style={{ minWidth: 80 }}
          >
            {item}
          </Button>
        )}
      />

      {isLoading ? (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Spinner size="default" variant="dots" label="Fetching Sales" />
        </View>
      ) : isError ? (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text style={{ color: red }}>
            {error.message ?? "Something went wrong"}
          </Text>
        </View>
      ) : isSuccess && data?.length === 0 ? (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text variant="caption">{"No sales found"}</Text>
          <View
            style={{
              position: "absolute",
              bottom: 7,
              right: 7,
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
              onPress={() => router.push("/createPurchaseOrSale?type=sale")}
            />
          </View>
        </View>
      ) : isSuccess ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <SalesCard
                handleReverse={() => {
                  setModalId(item.id);
                  dialog.open();
                }}
                transaction={item}
              />
            )}
          />
          <View
            style={{
              position: "absolute",
              bottom: 7,
              right: 7,
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
              onPress={() => router.push("/createPurchaseOrSale?type=sale")}
            />
          </View>
        </View>
      ) : null}
      <AlertDialog
        isVisible={dialog.isVisible}
        onClose={dialog.close}
        title="Are you sure you want to reverse this sale?"
        description="This action cannot be undone."
        confirmText="Yes, Reverse"
        cancelText="Cancel"
        onConfirm={() => {
          setLoading(true);
          handleReverseTransaction(modalId);
        }}
        onCancel={dialog.close}
      />
      <LoadingOverlay
        visible={loading}
        size='lg'
        variant='cirlce'
        label='Processing...'
        backdrop={true}
        backdropOpacity={0.7}
      />
    </View>
  );
};

export default SalesTransaction;
