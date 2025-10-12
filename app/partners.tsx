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
import PartnerCard from "@/components/PartnerCard";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { deletePartner, getPartners } from "@/service/partners";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

const Partners = () => {
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

  const filters = ["All", "Supplier", "Customer"];

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["partners", filter, debouncedSearchTerm],
    queryFn: () => getPartners(1, search, filter),
  });

  // Centralized header component
  const handleEditPartner = (partnerId: string) => {
    router.push(`/editPartner/${partnerId}`);
  };

  const handleDeletePartner = async (partnerId: string) => {
    await deletePartner(Number(partnerId));
    queryClient.invalidateQueries({ queryKey: ["partners"] });
    toast({
      title: "Deletion successful",
      variant: "success",
    });
  };

  const renderHeader = () => (
    <View>
      {/* Title Section */}
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
          Partners
        </Text>
        <Text variant="body" style={{ color: mutedColor }}>
          Manage your suppliers and customers
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
        <SearchBar
          placeholder="Search partners..."
          value={search}
          onChangeText={setSearch}
          showClearButton={true}
        />
      </View>

      {/* Filter Chips */}
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
          <Spinner size="default" variant="dots" label="Fetching Partners" />
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
          <Text variant="caption">{"No partners found"}</Text>
        </View>
      );
    }

    if (data) {
      return (
        <>
          <FlatList
            data={data}
            keyExtractor={(partner) => partner.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <PartnerCard
                partner={item}
                onEdit={() => handleEditPartner(item.id)}
                onDelete={() => {
                  toast({
                    title: `Are you sure you want to delete ${item.first_name}`,
                    description:
                      "Their record will still be kept but won't appear as customer in your lists",
                    duration: 3000,
                    variant: "warning",
                    action: {
                      label: "Delete",
                      onPress: () => {
                        handleDeletePartner(item.id);
                      },
                    },
                  });
                }}
              />
            )}
          />
        </>
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
            onPress={() => router.push("/editPartner/new")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Partners;
