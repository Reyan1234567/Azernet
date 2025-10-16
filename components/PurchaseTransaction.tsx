import { FlatList, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPurchaseTransactions,
  deleteItemTransaction,
} from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import PurchaseCard from "./PurchaseCard";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";
import { reversePurchase } from "@/service/reversals";

const PurchaseTransaction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("text");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Paid", "Unpaid"];
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["purchaseTransactions", filter, debouncedSearchTerm],
    queryFn: () => getAllPurchaseTransactions(1, search, filter),
  });

  const handleReverseTransaction = async (transactionId: number) => {
    try {
      await reversePurchase(transactionId);
      queryClient.invalidateQueries({ queryKey: ["purchaseTransactions"] });
      toast({
        title: "Purchase reversed successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to reverse purchase",
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
              onPress={() => router.push("/createPurchaseOrSale?type=purchase")}
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
              <PurchaseCard
                handleReverse={() => {
                  toast({
                    title: `Are you sure you want to reverse this purchase?`,
                    duration: 10000,
                    description: `${item.item_name} purchase will be reversed`,
                    variant: "warning",
                    action: {
                      label: "Reverse",
                      onPress: () => {
                        handleReverseTransaction(item.id);
                      },
                    },
                  });
                }}
                transaction={item}
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
              onPress={() => router.push("/createPurchaseOrSale?type=purchase")}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default PurchaseTransaction;
