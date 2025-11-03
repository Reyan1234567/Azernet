import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import {
  Building2,
  Users,
  Package,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react-native";
import React from "react";
import { useRouter } from "expo-router";
import TopBar from "@/components/topBar";
import FundBusiness from "@/components/FundBusiness";

const Business = () => {
  const router = useRouter();
  const bgColor = useColor("background");
  const cardBg = useColor("card");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

  // Sample business data
  const businessInfo = {
    name: "Zaha Trading Co.",
    owner: "Ahmed Hassan",
    phone: "+251 911 123 456",
    email: "info@zahatrading.com",
    address: "Bole, Addis Ababa, Ethiopia",
    established: "2020",
    type: "Import/Export",
  };

  // Sample items data
  const items = [
    {
      id: "1",
      name: "Samsung Galaxy A36",
      measure: "Item",
      purchasePrice: 15000,
      sellingPrice: 18000,
    },
    {
      id: "2",
      name: "iPhone 15",
      measure: "Item",
      purchasePrice: 45000,
      sellingPrice: 52000,
    },
    {
      id: "3",
      name: "Dell Laptop",
      measure: "Item",
      purchasePrice: 35000,
      sellingPrice: 42000,
    },
    {
      id: "4",
      name: "Coffee Beans",
      measure: "KG",
      purchasePrice: 250,
      sellingPrice: 350,
    },
  ];

  // Sample partners data
  const partners = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      phone: "+251 911 234 567",
      role: "Supplier",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+251 911 345 678",
      role: "Customer",
    },
    {
      id: "3",
      firstName: "Ahmed",
      lastName: "Ali",
      phone: "+251 911 456 789",
      role: "Supplier",
    },
    {
      id: "4",
      firstName: "Sara",
      lastName: "Mohammed",
      phone: "+251 911 567 890",
      role: "Customer",
    },
  ];

  const handleNavigateToPartners = () => {
    router.navigate("/partners");
  };

  const handleNavigateToItems = () => {
    router.navigate("/items");
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <ScrollView>
        <Text variant="title" style={{ color: textColor, padding: 20 }}>
          Business Related Action
        </Text>
        <Separator style={{ width: "90%", marginHorizontal: 20 }} />
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <FundBusiness />
        </View>
        <Text variant="title" style={{ color: textColor, padding: 20 }}>
          Business Related Info
        </Text>
        <Separator style={{ width: "90%", marginHorizontal: 20 }} />
        <View style={{ gap: 16, padding: 20 }}>
          <TouchableOpacity onPress={handleNavigateToPartners}>
            <Card style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: primaryColor + "20",
                      padding: 12,
                      borderRadius: 12,
                      marginRight: 16,
                    }}
                  >
                    <Users size={24} color={primaryColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="title"
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 4,
                        color: textColor,
                      }}
                    >
                      Partners
                    </Text>
                    <Text variant="body" style={{ color: mutedColor }}>
                      Manage your suppliers and customers
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: mutedColor, marginTop: 4 }}
                    >
                      {partners.length} partners registered
                    </Text>
                  </View>
                </View>

                <Text variant="caption" style={{ color: mutedColor }}>
                  <ChevronRight />
                </Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateToItems}>
            <Card style={{ padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: primaryColor + "20",
                      padding: 12,
                      borderRadius: 12,
                      marginRight: 16,
                    }}
                  >
                    <Package size={24} color={primaryColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="title"
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 4,
                        color: textColor,
                      }}
                    >
                      Items
                    </Text>
                    <Text variant="body" style={{ color: mutedColor }}>
                      Manage your products and inventory
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: mutedColor, marginTop: 4 }}
                    >
                      {items.length} items in catalog
                    </Text>
                  </View>
                </View>

                <Text variant="caption" style={{ color: mutedColor }}>
                  <ChevronRight />
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Business;
