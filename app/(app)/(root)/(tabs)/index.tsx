import { StyleSheet, ScrollView } from "react-native";
import React, { useContext, useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useRouter } from "expo-router";
import { useColor } from "@/hooks/useColor";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  TrendingDown,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import TopBar from "@/components/topBar";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/service/dashboard";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import Currency from "@/components/currency";
import { BusinessContext } from "@/context/businessContext";

const Index = () => {
  const bgColor = useColor("background");
  const cardBg = useColor("card");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const BUSINESS = useContext(BusinessContext);
  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ["dashboard", selectedDate, BUSINESS?.businessId],
    queryFn: () =>
      getDashboardData(BUSINESS?.businessId, selectedDate ?? new Date()),
  });

  // Use useMemo to extract and stabilize dashboard data access
  const dashboardData = useMemo(() => data?.[0] || {}, [data]);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <ScrollView
        contentContainerStyle={[styles.container, { flex: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading" style={{ color: textColor, fontSize: 28 }}>
            Dashboard
          </Text>
          <Text variant="body" style={{ color: mutedColor, marginTop: 4 }}>
            Welcome back! Here&apos;s your business overview
          </Text>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Choose a date to filter"
            style={{ marginTop: 15 }}
          />
        </View>

        {isLoading ? (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner />
            <Text style={{ color: textColor, marginTop: 8 }}>Loading</Text>
          </View>
        ) : isError ? (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ef4444" }}>
              {error?.message ?? "Something went wrong"}
            </Text>
          </View>
        ) : isSuccess ? (
          <View style={styles.statsGrid}>
            {/* Total Revenue Card */}
            <Card
              style={{
                backgroundColor: cardBg,
                flex: 1,
                minWidth: "47%",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#10b98120" },
                  ]}
                >
                  <DollarSign size={20} color="#10b981" />
                </View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8 }}
                >
                  Total Revenue
                </Text>
                <Text
                  variant="title"
                  style={{
                    color: textColor,
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 4,
                  }}
                >
                  {<Currency currency={dashboardData.total_revenue} />}
                </Text>
              </View>
            </Card>

            {/* Total Orders Card */}
            <Card
              style={[
                styles.statCard,
                { backgroundColor: cardBg, width: "fit-content" },
              ]}
            >
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#3b82f620" },
                  ]}
                >
                  <ShoppingCart size={20} color="#3b82f6" />
                </View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8 }}
                >
                  Total Orders
                </Text>
                <Text
                  variant="title"
                  style={{
                    color: textColor,
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 4,
                  }}
                >
                  {dashboardData.total_orders || 0}
                </Text>
              </View>
            </Card>

            {/* Items Sold Card */}
            <Card style={[styles.statCard, { backgroundColor: cardBg }]}>
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#f59e0b20" },
                  ]}
                >
                  <Package size={20} color="#f59e0b" />
                </View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8 }}
                >
                  Items Sold
                </Text>
                <Text
                  variant="title"
                  style={{
                    color: textColor,
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 4,
                  }}
                >
                  {dashboardData.items_sold || 0}
                </Text>
              </View>
            </Card>

            {/* Total Profit Card */}
            <Card style={[styles.statCard, { backgroundColor: cardBg }]}>
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: "#8b5cf620" },
                  ]}
                >
                  {dashboardData.total_profit > 0 ? (
                    <TrendingUp size={20} color="#8b5cf6" />
                  ) : (
                    <TrendingDown size={20} color="#c6002bff" />
                  )}
                </View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8 }}
                >
                  {dashboardData.total_profit > 0
                    ? "Total Profit"
                    : "Total loss"}
                </Text>
                <Text
                  variant="title"
                  style={{
                    color: textColor,
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 4,
                  }}
                >
                  {<Currency currency={dashboardData.total_profit} />}
                </Text>
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};
export default Index;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 12,
    padding: 16,
  },
  statContent: {
    alignItems: "flex-start",
    width: "auto",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chartsSection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  card: {
    flexGrow: 1,
    flexBasis: "48%",
    borderColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
});
