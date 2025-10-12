import { FlatList, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllOrders,
  deleteOrder,
} from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import OrderCard from "./OrderCard";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";

const OrdersComponent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Paid", "Unpaid"];
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["orders", filter, debouncedSearchTerm],
    queryFn: () => getAllOrders(1, search, filter),
  });

  const handleDeleteOrder = async (
    orderId: number,
    description: string
  ) => {
    try {
      await deleteOrder(orderId);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Order deleted successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete order",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    }
  };

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
        <View
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: "35%",
            flex: 1,
          }}
        >
          <Text variant="caption">{"No orders found"}</Text>
        </View>
      )}
      {isSuccess && (
        <View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <OrderCard
                handleDelete={() => {
                  toast({
                    title: `Are you sure you want to delete this order?`,
                    duration: 10000,
                    description: `${item.description || "Order"} will be marked as deleted`,
                    variant: "warning",
                    action: {
                      label: "Delete",
                      onPress: () => {
                        handleDeleteOrder(
                          item.id,
                          item.description || "Order"
                        );
                      },
                    },
                  });
                }}
                handleEdit={() => {
                  router.push(`/editOrder/${item.id}`);
                }}
                order={item}
              />
            )}
          />

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
              onPress={() => router.push("/editOrder/new")}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default OrdersComponent;
