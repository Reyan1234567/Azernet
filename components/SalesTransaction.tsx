import { FlatList, RefreshControl, View } from "react-native";
import { Text } from "./ui/text";
import React, { useContext, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSalesTransactions } from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import SalesCard from "./SalesCard";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner, LoadingOverlay } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import SnackBarToast from "./SnackBarToast";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { reverseSale } from "@/service/reversals";
import { AlertDialog, useAlertDialog } from "./ui/alert-dialog";
import { BusinessContext } from "@/context/businessContext";
import AddButton from "./addButton";

const SalesTransaction = () => {
  const length = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const red = useColor("red");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalId, setModalId] = useState(0);
  const dialog = useAlertDialog();
  const filters = useMemo(() => ["All", "Paid", "Unpaid"], []);
  const debouncedSearchTerm = useDebounce(search, 300);
  const BUSINESS = useContext(BusinessContext);

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: [
      "salesTransactions",
      BUSINESS?.businessId,
      debouncedSearchTerm,
      filter,
    ],
    queryFn: () =>
      getAllSalesTransactions(BUSINESS?.businessId, search, filter),
  });

  const handleReverseTransaction = useCallback(
    async (transactionId: number) => {
      setLoading(true);
      try {
        await reverseSale(transactionId);
        queryClient.invalidateQueries({ queryKey: ["salesTransactions"] });
        SnackBarToast({
          message: "Sale reversed successfully",
          isSuccess: true,
          marginBottom: length,
        });
        dialog.close();
      } catch (error: any) {
        SnackBarToast({
          message: error.message ?? "Failed to reverse sale",
          isSuccess: false,
          marginBottom: length,
        });
      } finally {
        setLoading(false);
      }
    },
    [dialog, length, queryClient]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries({ queryKey: ["salesTransactions"] });
    setIsRefreshing(false);
  }, [queryClient]);

  const renderSaleItem = useCallback(
    ({ item }: { item: any }) => (
      <SalesCard
        handleReverse={() => {
          setModalId(item.id);
          dialog.open();
        }}
        handleDebt={() =>
          router.push(
            `/amountUnpaid?id=${item.id}&debt=${item.unpaid_amount}&type=sale`
          )
        }
        transaction={item}
      />
    ),
    [dialog]
  );

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
            <Text variant="caption">No sales found</Text> 
          <View
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
              zIndex: 1000,
            }}
          >
            <AddButton
              onPress={() => {
                router.push("/createPurchaseOrSale?type=sale");
              }}
            />
             
          </View>
        </View>
      ) : isSuccess ? (
        <View style={{ flex: 1 }}>
           
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 70 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            renderItem={renderSaleItem}
          />
           
          <View
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
              zIndex: 1000,
            }}
          >
            <AddButton
              onPress={() => {
                router.push("/createPurchaseOrSale?type=sale");
              }}
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
        size="lg"
        variant="cirlce"
        label="Processing..."
        backdrop={true}
        backdropOpacity={0.7}
      />
    </View>
  );
};

export default SalesTransaction;
