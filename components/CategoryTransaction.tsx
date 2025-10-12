import { FlatList, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategoryTransactions,
  deleteTransaction,
} from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import TransactionCard from "./TransactionCard";
import { Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";

const CategoryTransaction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Paid", "Unpaid", "Purchase", "Sale"];
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["categoryTransactions", filter, debouncedSearchTerm],
    queryFn: () => getAllCategoryTransactions(1, search, filter, filter),
  });

  const handleDeleteTransaction = async (
    transactionId: number,
    categoryName: string
  ) => {
    try {
      await deleteTransaction(transactionId);
      queryClient.invalidateQueries({ queryKey: ["categoryTransactions"] });
      toast({
        title: "Transaction deleted successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete transaction",
        description: error.message ?? "Something went wrong",
        variant: "error",
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search transactions..."
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
          <Spinner size="default" variant="dots" label="Fetching Categories" />
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
          <Text variant="caption">{"No categories found"}</Text>
        </View>
      )}
      {isSuccess && (
        <View style={{flex: 1}}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.transaction_id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TransactionCard
                handleDelete={() => {
                  toast({
                    title: `Are you sure you want to delete this transaction?`,
                    duration: 10000,
                    description: `${item.category_name} transaction will be marked as deleted`,
                    variant: "warning",
                    action: {
                      label: "Delete",
                      onPress: () => {
                        handleDeleteTransaction(
                          item.transaction_id,
                          item.category_name
                        );
                      },
                    },
                  });
                }}
                handleEdit={() => {
                  router.push(`/editCategoryTransaction/${item.transaction_id}`);
                }}
                transaction={item}
                transactionType="category"
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
              onPress={() => router.push("/editCategoryTransaction/new")}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default CategoryTransaction;
