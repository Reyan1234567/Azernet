import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";

import { useColor } from "@/hooks/useColor";
import { Image } from "@/components/ui/image";

import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  Briefcase,
  Building,
  LucidePersonStanding,
  PackageOpen,
  Plus,
  User,
} from "lucide-react-native";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import BusinessView from "./BusinessView";
import { useBusiness } from "@/context/businessContext";
import { router } from "expo-router";
import { useAuth } from "@/context/authContext";
import { ScrollView } from "react-native-gesture-handler";
interface sheetInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SheetLeft({ open, setOpen }: sheetInterface) {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const cardColor = useColor("card");
  const foreground = useColor("foreground");
  const BUSINESS = useBusiness();
  const AUTH = useAuth();
  return (
    <Sheet open={open} onOpenChange={setOpen} side="left">
      <SheetContent
        style={{
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          paddingTop: 30,
          paddingHorizontal: 0,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            {AUTH.profile?.profilePic ? (
              <View style={{ marginRight: 12 }}>
                <Image
                  source={{
                    uri: AUTH.profile?.profilePic,
                  }}
                  variant="circle"
                  width={50}
                  aspectRatio={1}
                />
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: cardColor }]}>
                <Text style={[styles.avatarText, { color: textColor }]}>
                  {AUTH.session?.user.user_metadata.name.slice(0, 1) ?? "!"}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>
                {AUTH.profile?.firstName + " " + AUTH.profile?.lastName}
              </Text>
              {AUTH.session?.user.phone && (
                <Text style={[styles.userPhone, { color: mutedColor }]}>
                  +251 978344283
                </Text>
              )}
            </View>
          </View>
          <Separator />
          <ScrollView style={styles.menuSection}>
            <BusinessView
              key={0}
              name={"My account"}
              onClick={()=>router.navigate("/(app)/(root)/profile")}
              icon={<User color={textColor}/>}
              selected={false}
            />
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <BusinessView
                    name={"My Businesses"}
                    onClick={() => {}}
                    icon={<Building color={textColor} />}
                    selected={false}
                    key={9999}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <View style={{ paddingLeft: 20 }}>
                    {BUSINESS?.businesses?.map((business, index) => (
                      <BusinessView
                        name={business.business_name}
                        key={index}
                        onClick={() => {
                          if (BUSINESS.businessId !== business.id) {
                            BUSINESS.setBusiness(business.id);
                            // router.canGoBack() && router.dismissAll();
                            router.navigate("/(app)/(root)/(tabs)");
                            setOpen(false);
                          }
                        }}
                        icon={<Briefcase color={textColor} />}
                        selected={BUSINESS.businessId === business.id}
                      />
                    ))}
                    <TouchableOpacity
                      onPress={() => {
                        setOpen(false);
                        router.navigate("/(app)/(root)/createBusiness");
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 12,
                          paddingLeft: 30,
                          gap: 20,
                        }}
                      >
                        <Plus size={15} color={foreground} />
                        <Text style={{ color: textColor }}>Add Business</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <BusinessView
              name={"My Items"}
              onClick={() => {
                router.navigate("/(app)/(root)/items");
              }}
              icon={<PackageOpen color={textColor} />}
              selected={false}
              key={999999}
            />
            <BusinessView
              name={"My Partners"}
              onClick={() => {
                router.navigate("/(app)/(root)/partners");
              }}
              icon={<LucidePersonStanding color={textColor} />}
              selected={false}
              key={999900}
            />
          </ScrollView>
        </View>
        <View>
          <Separator />
          <View style={styles.footer}>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactText, { color: mutedColor }]}>
                @reyanber
              </Text>
              <Text
                style={[
                  styles.contactText,
                  { color: mutedColor, marginHorizontal: 8 },
                ]}
              >
                •
              </Text>
              <Text style={[styles.contactText, { color: mutedColor }]}>
                0978344283
              </Text>
            </View>
          </View>
        </View>
      </SheetContent>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  menuSection: {
    paddingVertical: 8,
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  footerLabel: {
    fontSize: 14,
    marginLeft: 12,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  contactText: {
    fontSize: 13,
    textAlign: "center",
  },
});
