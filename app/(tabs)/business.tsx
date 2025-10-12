import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useColor } from "@/hooks/useColor";
import { Building2, Users, Package, Phone, Mail, MapPin, ChevronRight } from "lucide-react-native";
import React from "react";
import { useRouter } from "expo-router";
import TopBar from "@/components/topBar";

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
    type: "Import/Export"
  };

  // Sample items data
  const items = [
    {
      id: "1",
      name: "Samsung Galaxy A36",
      measure: "Item",
      purchasePrice: 15000,
      sellingPrice: 18000
    },
    {
      id: "2",
      name: "iPhone 15",
      measure: "Item",
      purchasePrice: 45000,
      sellingPrice: 52000
    },
    {
      id: "3",
      name: "Dell Laptop",
      measure: "Item",
      purchasePrice: 35000,
      sellingPrice: 42000
    },
    {
      id: "4",
      name: "Coffee Beans",
      measure: "KG",
      purchasePrice: 250,
      sellingPrice: 350
    }
  ];

  // Sample partners data
  const partners = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      phone: "+251 911 234 567",
      role: "Supplier"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+251 911 345 678",
      role: "Customer"
    },
    {
      id: "3",
      firstName: "Ahmed",
      lastName: "Ali",
      phone: "+251 911 456 789",
      role: "Supplier"
    },
    {
      id: "4",
      firstName: "Sara",
      lastName: "Mohammed",
      phone: "+251 911 567 890",
      role: "Customer"
    }
  ];

  const handleNavigateToPartners = () => {
    router.push("/partners");
  };

  const handleNavigateToItems = () => {
    router.push("/items");
  };

  const handleNavigateToReports = () => {
    router.push("/categories")
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <TopBar />
      <Tabs defaultValue="info">
        <TabsList style={{ 
          flexDirection: "row",
          margin: 16, 
          marginBottom: 0,
          backgroundColor: cardBg,
          borderRadius: 12,
          padding: 4,
          gap: 4
        }}>
          <TabsTrigger 
            value="info" 
            style={{ 
              flex: 1, 
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Business Info
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            style={{ 
              flex: 1, 
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Business Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Card style={{ marginBottom: 24 }}>
              <View style={{ padding: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <Building2 size={24} color={primaryColor} style={{ marginRight: 12 }} />
                  <Text variant="title" style={{ fontSize: 20, fontWeight: "bold", color:textColor }}>
                    {businessInfo.name}
                  </Text>
                </View>
                
                <Separator style={{ marginVertical: 16 }} />
                
                <View style={{ gap: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Users size={18} color={mutedColor} style={{ marginRight: 12, width: 24 }} />
                    <View>
                      <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                        Owner
                      </Text>
                      <Text variant="body" style={{ fontWeight: "500", color:textColor}}>
                        {businessInfo.owner}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: "row", alignItems: "center"}}>
                    <Phone size={18} color={mutedColor} style={{ marginRight: 12, width: 24 }} />
                    <View>
                      <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                        Phone
                      </Text>
                      <Text variant="body" style={{ fontWeight: "500", color:textColor}}>
                        {businessInfo.phone}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Mail size={18} color={mutedColor} style={{ marginRight: 12, width: 24 }} />
                    <View>
                      <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                        Email
                      </Text>
                      <Text variant="body" style={{ fontWeight: "500", color:textColor }}>
                        {businessInfo.email}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <MapPin size={18} color={mutedColor} style={{ marginRight: 12, width: 24, marginTop: 2 }} />
                    <View>
                      <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                        Address
                      </Text>
                      <Text variant="body" style={{ fontWeight: "500", color:textColor }}>
                        {businessInfo.address}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Separator style={{ marginVertical: 16 }} />
                
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                      Established
                    </Text>
                    <Text variant="body" style={{ fontWeight: "600" }}>
                      {businessInfo.established}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text variant="caption" style={{ color: mutedColor, fontSize: 12 }}>
                      Business Type
                    </Text>
                    <Text variant="body" style={{ fontWeight: "600" }}>
                      {businessInfo.type}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
            
            <Button variant="outline" style={{ marginBottom: 16 }}>
              Edit Business Information
            </Button>
          </ScrollView>
        </TabsContent>
        
        <TabsContent value="details">
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <View style={{ gap: 16 }}>
              {/* Partners Navigation Card */}
              <TouchableOpacity
                onPress={handleNavigateToPartners}
              >
                <Card style={{ padding: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={{ 
                        backgroundColor: primaryColor + "20", 
                        padding: 12, 
                        borderRadius: 12, 
                        marginRight: 16 
                      }}>
                        <Users size={24} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="title" style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4, color: textColor }}>
                          Partners
                        </Text>
                        <Text variant="body" style={{ color: mutedColor }}>
                          Manage your suppliers and customers
                        </Text>
                        <Text variant="caption" style={{ color: mutedColor, marginTop: 4 }}>
                          {partners.length} partners registered
                        </Text>
                      </View>
                    </View>
                    
                      <Text variant="caption" style={{ color: mutedColor }}>
                        <ChevronRight/>
                      </Text>
                    </View>
                </Card>
              </TouchableOpacity>

              {/* Items Navigation Card */}
              <TouchableOpacity
                onPress={handleNavigateToItems}
              >
                <Card style={{ padding: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={{ 
                        backgroundColor: primaryColor + "20", 
                        padding: 12, 
                        borderRadius: 12, 
                        marginRight: 16 
                      }}>
                        <Package size={24} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="title" style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4, color:textColor }}>
                          Items
                        </Text>
                        <Text variant="body" style={{ color: mutedColor }}>
                          Manage your products and inventory
                        </Text>
                        <Text variant="caption" style={{ color: mutedColor, marginTop: 4 }}>
                          {items.length} items in catalog
                        </Text>
                      </View>
                    </View>
          
                      <Text variant="caption" style={{ color: mutedColor }}>
                        <ChevronRight/>
                      </Text>
                  </View>
                </Card>
              </TouchableOpacity>

              {/* Additional Business Management Cards */}
              <TouchableOpacity
                onPress={handleNavigateToReports}
              >
                <Card style={{ padding: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={{ 
                        backgroundColor: primaryColor + "20", 
                        padding: 12, 
                        borderRadius: 12, 
                        marginRight: 16 
                      }}>
                        <Building2 size={24} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="title" style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4, color:textColor }}>
                          Categories
                        </Text>
                        <Text variant="body" style={{ color: mutedColor }}>
                          Manage Categories
                        </Text>
                        <Text variant="caption" style={{ color: mutedColor, marginTop: 4 }}>
                          Sales, purchases, and profit analysis
                        </Text>
                      </View>
                    </View>
                
                      <Text variant="caption" style={{ color: mutedColor }}>
                        <ChevronRight/>
                      </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
};

export default Business;
