import { FlatList, RefreshControl, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner, LoadingOverlay } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";
import { changeStatus, deleteOrder, getAllOrders } from "@/service/orders";
import OrderPendingCard from "./OrderPendingCard";
import OrderPurchasedCard from "./OrderPurchasedCard";
import OrderDeliveredCard from "./OrderDeliveredCard";
import { ORDERSTATUS } from "@/constants";

const OrdersComponent = () => {
  const { toast } = useToast();
  const dialog = useAlertDialog();
  const reverseToPending = useAlertDialog();
  const reverseToPurchased = useAlertDialog();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");

  const handlePurchasedReversal = async () => {
    setLoading(true);
    try {
      await changeStatus(ORDERSTATUS.PENDING, modalId);
      toast({
        title: "Purchase reversal successful",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", "purchases", "sales"],
      });
      reverseToPending.close();
    } catch (e) {
      toast({
        title: "Failed to reverse purchase",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeliveredReversal = async () => {
    setLoading(true);
    try {
      await changeStatus(ORDERSTATUS.PURCHASED, modalId);
      toast({
        title: "Delivered reversal successful",
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", "purchases", "sales"],
      });
      reverseToPurchased.close();
    } catch (e) {
      toast({
        title: "Failed to reverse delivered status",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalId, setModalId] = useState(0);
  const filters = ["All", "pending", "purchased", "delivered"];
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["orders", filter, debouncedSearchTerm],
    queryFn: () => getAllOrders(1, search, filter),
  });

  const handleDeleteOrder = async (orderId: number) => {
    setLoading(true);
    try {
      await deleteOrder(orderId);
      queryClient.invalidateQueries({
        queryKey: ["orders", "purchases", "sales"],
      });
      toast({
        title: "Order deleted successfully",
        variant: "success",
      });
      dialog.close();
    } catch (error: any) {
      toast({
        title: "Failed to delete order",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries({ queryKey: ["orders"] });
    setIsRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
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
        renderItem={({ item }) => {
          return (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              size="sm"
              onPress={() => setFilter(item)}
              style={{ minWidth: 80 }}
            >
              {item}
            </Button>
          );
        }}
      />
      {isLoading && (
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: "50%",
            flex: 1,
          }}
        >
          <Spinner size="default" variant="dots" label="Fetching Orders" />
        </View>
      )}
      {isError && (
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: "50%",
            flex: 1,
          }}
        >
          <Text style={{ color: red }}>
            {error.message ?? "Something went wrong"}
          </Text>
        </View>
      )}
      {isSuccess && data?.length === 0 && (
        <>
          <View
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Text variant="caption">{"No orders found"}</Text>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
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
              onPress={() => router.push("/createOrder")}
            />
          </View>
        </>
      )}
      {isSuccess && data.length !== 0 && (
        <View style={{ flex: 1}}>
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
            renderItem={({ item }) => {
              return item.status === "pending" ? (
                <OrderPendingCard
                  order={item}
                  handleDelete={() => {
                    setModalId(item.id);
                    dialog.open();
                  }}
                  handleMarkAsPurchased={() =>
                    router.push(`/purchaseOrder/${item.id}`)
                  }
                />
              ) : item.status === "purchased" ? (
                <OrderPurchasedCard
                  order={item}
                  handleMarkAsDelivered={() => {
                    router.push(`/saleOrder/${item.id}`);
                  }}
                  handleReverseToPending={() => {
                    setModalId(item.id);
                    reverseToPending.open();
                  }}
                />
              ) : item.status === "delivered" ? (
                <OrderDeliveredCard
                  order={item}
                  handleReverseToPurchased={() => {
                    setModalId(item.id);
                    reverseToPurchased.open();
                  }}
                />
              ) : null;
            }}
          />
          <Button
            variant="default"
            size="lg"
            icon={Plus}
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: primaryColor,
            }}
            onPress={() => router.push("/createOrder")}
          />
          <AlertDialog
            isVisible={dialog.isVisible}
            onClose={dialog.close}
            title="Are you Sure you want to delete this order?"
            description="This action cannot be undone."
            confirmText="Yes, delete"
            cancelText="Cancel"
            onConfirm={() => {
              setLoading(true);
              handleDeleteOrder(modalId);
            }}
            onCancel={dialog.close}
          />

          <AlertDialog
            isVisible={reverseToPending.isVisible}
            onClose={reverseToPending.close}
            title="Are you Sure you want to reverse this order to a Pending state?"
            description="This action cannot be undone, and tracks of this won't be seen."
            confirmText="Yes, reverse"
            cancelText="Cancel"
            onConfirm={() => {
              setLoading(true);
              handlePurchasedReversal();
            }}
            onCancel={reverseToPending.close}
          />

          <AlertDialog
            isVisible={reverseToPurchased.isVisible}
            onClose={reverseToPurchased.close}
            title="Are you Sure you want to reverse this order to a Purchased state?"
            description="This action cannot be undone, and tracks of this won't be seen."
            confirmText="Yes, reverse"
            cancelText="Cancel"
            onConfirm={() => {
              setLoading(true);
              handleDeliveredReversal();
            }}
            onCancel={reverseToPurchased.close}
          />
        </View>
      )}
      <LoadingOverlay
        visible={loading}
        size="sm"
        variant="cirlce"
        label="Processing..."
        backdrop={true}
        backdropOpacity={0.7}
      />
    </View>
  );
};

export default OrdersComponent;
