import { FlatList, TouchableOpacity, View } from "react-native";
import { Text } from "./ui/text";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllItemTransactions,
  deleteItemTransaction,
} from "@/service/transaction";
import { SearchBar } from "./ui/searchbar";
import { Button } from "./ui/button";
import TransactionCard from "./TransactionCard";
import { ListFilter, Plus } from "lucide-react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";
import { Spinner } from "./ui/spinner";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "./ui/toast";
import { BottomSheet } from "./ui/bottom-sheet";
import { Separator } from "./ui/separator";

const ItemTransaction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const primaryColor = useColor("primary");
  const red = useColor("red");
  const textColor = useColor("primary");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [transactionTypes, setTrasnactionTypes] = useState("All");

  const [filter1, setFilter1] = useState("All");
  const [transactionTypes1, setTrasnactionTypes1] = useState("All");

  const filters = ["All", "Paid", "Unpaid"];
  const status = ["All", "Purchase", "Sale"];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(search, 300);
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: [
      "itemTransactions",
      filter,
      transactionTypes,
      debouncedSearchTerm,
    ],
    queryFn: () => getAllItemTransactions(1, search, filter, transactionTypes),
  });

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      await deleteItemTransaction(transactionId);
      queryClient.invalidateQueries({ queryKey: ["itemTransactions"] });
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
      <View
        style={{
          padding: 16,
          paddingBottom: 8,
          marginBottom: 5,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            showClearButton={true}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsFilterOpen(true)}
          style={{
            padding: 6,
            borderWidth: 2,
            borderColor: textColor,
            borderRadius: 10,
            backgroundColor: textColor,
            marginLeft: 10,
          }}
        >
          <ListFilter />
        </TouchableOpacity>
      </View>
      <BottomSheet
        isVisible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      >
        <Text
          variant="title"
          style={{ margin: 20, color: textColor, textAlign: "center" }}
        >
          Filters
        </Text>
        <Text style={{ marginLeft: 20, color: textColor }}>Payment Status</Text>
        <Separator style={{ margin: 20 }} />
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            //   backgroundColor: "white",
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
                variant={filter1 === item ? "default" : "outline"}
                size="sm"
                onPress={() => setFilter1(item)}
                style={{ minWidth: 80 }}
              >
                {item}
              </Button>
            );
          }}
        />
        <Text style={{ marginLeft: 20, color: textColor }}>
          Transaction kind
        </Text>
        <Separator style={{ margin: 20 }} />
        <FlatList
          data={status}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            //   backgroundColor: "white",
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
                variant={transactionTypes1 === item ? "default" : "outline"}
                size="sm"
                onPress={() => setTrasnactionTypes1(item)}
                style={{ minWidth: 80 }}
              >
                {item}
              </Button>
            );
          }}
        />
        <Button
          style={{ marginBottom: 20 }}
          onPress={() => {
            setFilter(filter1);
            setTrasnactionTypes(transactionTypes1);
            setIsFilterOpen(false);
          }}
        >
          Apply
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            setFilter1("All");
            setTrasnactionTypes1("All");
            setFilter("All");
            setTrasnactionTypes("All");
            setIsFilterOpen(false);
          }}
        >
          Reset
        </Button>
      </BottomSheet>
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
          <Spinner size="default" variant="dots" label="Fetching Items" />
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
          <Text variant="caption">{"No items found"}</Text>
        </View>
      )}
      {isSuccess && (
        <View style={{ flex: 1 }}>
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
                    description: `${item.item_name} transaction will be marked as deleted`,
                    variant: "warning",
                    action: {
                      label: "Delete",
                      onPress: () => {
                        handleDeleteTransaction(item.transaction_id);
                      },
                    },
                  });
                }}
                handleEdit={() => {
                  router.push(`/editItemTransaction/${item.transaction_id}`);
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
              onPress={() => router.push("/editItemTransaction/new")}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default ItemTransaction;
