import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import { Users, Package, ChevronRight } from "lucide-react-native";
import React from "react";
import { useRouter } from "expo-router";
import TopBar from "@/components/topBar";
import FundBusiness from "@/components/FundBusiness";

const Business = () => {
  const router = useRouter();
  const bgColor = useColor("background");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");

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
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNavigateToPartners}
          >
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
                  </View>
                </View>

                <Text variant="caption" style={{ color: mutedColor }}>
                  <ChevronRight color={textColor} />
                </Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNavigateToItems}
          >
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
                  </View>
                </View>

                <Text variant="caption" style={{ color: mutedColor }}>
                  <ChevronRight color={textColor} />
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
