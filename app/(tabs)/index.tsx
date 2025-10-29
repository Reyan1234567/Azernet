import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/charts/chart-container";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { useColor } from "@/hooks/useColor";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import TopBar from "@/components/topBar";

const Index = () => {
  const router = useRouter();
  const bgColor = useColor("background");
  const cardBg = useColor("card");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

  const revenueData = [
    { label: "Mon", value: 120, color: "#3b82f6" },
    { label: "Tue", value: 180, color: "#ef4444" },
    { label: "Wed", value: 150, color: "#10b981" },
    { label: "Thu", value: 220, color: "#f59e0b" },
    { label: "Fri", value: 260, color: "#8b5cf6" },
    { label: "Sat", value: 210, color: "#06b6d4" },
    { label: "Sun", value: 300, color: "#ec4899" },
  ];

  const ordersData = [
    { label: "Mon", value: 8, color: "#10b981" },
    { label: "Tue", value: 12, color: "#3b82f6" },
    { label: "Wed", value: 9, color: "#f59e0b" },
    { label: "Thu", value: 15, color: "#ef4444" },
    { label: "Fri", value: 18, color: "#8b5cf6" },
    { label: "Sat", value: 14, color: "#06b6d4" },
    { label: "Sun", value: 20, color: "#ec4899" },
  ];

  const stats = [
    {
      label: "Total Revenue",
      value: "$1,440",
      icon: DollarSign,
      color: "#10b981",
    },
    {
      label: "Total Orders",
      value: "96",
      icon: ShoppingCart,
      color: "#3b82f6",
    },
    { label: "Items Sold", value: "234", icon: Package, color: "#f59e0b" },
    { label: "Growth", value: "+12%", icon: TrendingUp, color: "#8b5cf6" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading" style={{ color: textColor, fontSize: 28 }}>
            Dashboard
          </Text>
          <Text variant="body" style={{ color: mutedColor, marginTop: 4 }}>
            Welcome back! Here's your business overview
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card
              key={index}
              style={[styles.statCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: stat.color + "20" },
                  ]}
                >
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text
                  variant="caption"
                  style={{ color: mutedColor, marginTop: 8 }}
                >
                  {stat.label}
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
                  {stat.value}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text
            variant="subtitle"
            style={{ color: textColor, marginBottom: 12, fontSize: 18 }}
          >
            Analytics
          </Text>
          <View style={styles.row}>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <ChartContainer
                title="Weekly Revenue"
                description="Revenue performance by day"
              >
                <LineChart
                  data={revenueData}
                  config={{
                    height: 200,
                    showLabels: true,
                    animated: true,
                    duration: 1000,
                  }}
                />
              </ChartContainer>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <ChartContainer
                title="Weekly Orders"
                description="Order volume by day"
              >
                <BarChart
                  data={ordersData}
                  config={{
                    height: 200,
                    showLabels: true,
                    animated: true,
                    duration: 1000,
                  }}
                />
              </ChartContainer>
            </View>
          </View>
        </View>
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
