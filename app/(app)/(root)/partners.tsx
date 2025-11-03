import React, { useCallback, useMemo, useState } from "react";
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
import { Spinner, LoadingOverlay } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { useContext } from "react";
import { BusinessContext } from "@/context/businessContext";

const Partners = () => {
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

  const filters = ["All", "Supplier", "Customer"];

  const businessContext = useContext(BusinessContext);
  if (!businessContext) {
    throw new Error("BusinessContext is not available");
  }
  const { businessId } = businessContext;

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: ["partners", filter, debouncedSearchTerm, businessId],
    queryFn: () => {
      if (!businessId) throw new Error("No business ID found");
      return getPartners(Number(businessId), search, filter);
    },
    enabled: !!businessId,
  });

  // Centralized header component
  const handleEditPartner = useCallback((partnerId: string) => {
    router.push(`/editPartner/${partnerId}`);
  }, []);

  const handleDeletePartner = useCallback(
    (partnerId: string) => {
      setModalId(Number(partnerId));
      dialog.open();
    },
    [dialog]
  );

  const confirmDelete = useCallback(async () => {
    setLoading(true);
    try {
      await deletePartner(modalId);
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "Deletion successful",
        variant: "success",
      });
      dialog.close();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error deleting partner",
          description: error.message,
          variant: "error",
        });
      } else {
        toast({
          title: "Error deleting partner",
          description: "Something went wrong!",
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [dialog, modalId, queryClient, toast]);

  const renderHeader = useMemo(
    () => (
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
            Partners
          </Text>
          <Text variant="body" style={{ color: mutedColor }}>
            Manage your suppliers and customers
          </Text>
        </View>

        <View style={{ padding: 16, paddingBottom: 8, marginBottom: 5 }}>
          <SearchBar
            placeholder="Search partners..."
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
    ),
    [filter, filters, mutedColor, search, textColor]
  );

  const renderContent = useCallback(() => {
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
                onDelete={() => handleDeletePartner(item.id)}
              />
            )}
          />
        </>
      );
    }

    return null;
  }, [
    data,
    error,
    handleDeletePartner,
    handleEditPartner,
    isError,
    isLoading,
    isSuccess,
    red,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1, backgroundColor: bgColor, paddingTop: 24 }}>
        {renderHeader}
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
      <AlertDialog
        isVisible={dialog.isVisible}
        onClose={dialog.close}
        title="Are you sure you want to delete this partner?"
        description="Their record will still be kept but won't appear in your lists."
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

export default Partners;
