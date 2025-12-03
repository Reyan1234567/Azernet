import { FlatList, RefreshControl, ToastAndroid, View } from "react-native";
import { Text } from "./ui/text";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllPurchaseTransactions } from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import PurchaseCard from "./PurchaseCard";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner, LoadingOverlay } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";
import { reversePurchase } from "@/service/reversals";
import { AlertDialog, useAlertDialog } from "./ui/alert-dialog";
import { BusinessContext } from "@/context/businessContext";
import SnackBarToast from "./SnackBarToast";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import AddButton from "./addButton";

const PurchaseTransaction = () => {
  const { toast } = useToast();
  const length = useBottomTabBarHeight() || 0;
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const dialog = useAlertDialog();
  const [modalId, setModalId] = useState(0);

  const filters = useMemo(() => ["All", "Paid", "Unpaid"], []);
  const debouncedSearchTerm = useDebounce(search, 300);
  const BUSINESS = useContext(BusinessContext);

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: [
      "purchaseTransactions",
      BUSINESS?.businessId,
      debouncedSearchTerm,
      filter,
    ],
    queryFn: () =>
      getAllPurchaseTransactions(BUSINESS?.businessId, search, filter),
  });

  const handleReverseTransaction = useCallback(
    async (transactionId: number) => {
      setLoading(true);
      try {
        await reversePurchase(transactionId);
        queryClient.invalidateQueries({ queryKey: ["purchaseTransactions"] });
        SnackBarToast({
          message: "Purchase reversed successfully!",
          isSuccess: true,
          marginBottom: length,
        });
        dialog.close();
      } catch (error: any) {
        SnackBarToast({
          message: error.message ?? "Failed to reverse purchase",
          isSuccess: false,
          marginBottom: length,
        });
      } finally {
        setLoading(false);
      }
    },
    [dialog, queryClient, toast]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries({ queryKey: ["purchases"] });
    setIsRefreshing(false);
  }, [queryClient]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search orders..."
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
          <Spinner size="default" variant="dots" label="Fetching Purchases" />
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
          <Text variant="caption">{"No purchases found"}</Text>
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
                router.push("/createPurchaseOrSale?type=purchase");
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
            renderItem={({ item }) => (
              <PurchaseCard
                handleReverse={() => {
                  setModalId(item.id);
                  dialog.open();
                }}
                handleDebit={() =>
                  router.push(
                    `/amountUnpaid?id=${item.id}&debt=${item.unpaid_amount}&type=purchase`
                  )
                }
                transaction={item}
              />
            )}
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
                router.push("/createPurchaseOrSale?type=purchase");
              }}
            />
          </View>
        </View>
      ) : null}
      <AlertDialog
        isVisible={dialog.isVisible}
        onClose={dialog.close}
        title="Are Sure you want to reverse this purchase?"
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

export default PurchaseTransaction;
