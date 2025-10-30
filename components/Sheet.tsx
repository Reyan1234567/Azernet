import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useColor } from "@/hooks/useColor";
// import * as SecureStore from "expo-secure-store";
import React, { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { User, UserPlus, Zap, Briefcase, Building } from "lucide-react-native";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import BusinessView from "./BusinessView";
import { useQuery } from "@tanstack/react-query";
import { BusinessContext } from "@/context/businessContext";
import { getBusinessIds } from "@/service/business";
import { AuthContext } from "@/context/authContext";
import Business from "@/app/(tabs)/business";

interface sheetInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SheetLeft({ open, setOpen }: sheetInterface) {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const borderColor = useColor("border");
  const cardColor = useColor("card");
  const footerItems = [
    { icon: UserPlus, label: "Invite Friends" },
    { icon: Zap, label: "Telegram Features" },
  ];
  const BUSINESS = useContext(BusinessContext);
  return (
    <Sheet open={open} onOpenChange={setOpen} side="left">
      <SheetContent
        style={[
          styles.sheetContent,
          { flexDirection: "column", flex: 1, justifyContent: "space-between" },
        ]}
      >
        <View>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: cardColor }]}>
              <Text style={[styles.avatarText, { color: textColor }]}>RB</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>
                Reyan B
              </Text>
              <Text style={[styles.userPhone, { color: mutedColor }]}>
                +251 978344283
              </Text>
            </View>
          </View>
          <Separator />
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => console.log(`Pressed:`)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: cardColor }]}
              >
                <User size={20} color={textColor} />
              </View>
              <Text style={[styles.menuLabel, { color: textColor }]}>
                My account
              </Text>
            </TouchableOpacity>
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <BusinessView
                    name={"My Businesses"}
                    onClick={() => {}}
                    icon={true}
                    selected={false}
                    key={9999}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <View style={{ paddingLeft: 30 }}>
                    {BUSINESS?.businesses?.map((business, index) => (
                      <BusinessView
                        name={business.name}
                        key={index}
                        onClick={() => {
                          BUSINESS.setBusiness(business.id.toString());
                          // SecureStore.setItem(
                          //   "businessId",
                          //   String(business.id)
                          // );
                        }}
                        icon={false}
                        selected={BUSINESS.businessId === String(business.id)}
                      />
                    ))}
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </View>
          <Separator />
          <View style={styles.footer}>
            {footerItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.footerItem}
                  onPress={() => console.log(`Pressed: ${item.label}`)}
                >
                  <IconComponent size={18} color={mutedColor} />
                  <Text style={[styles.footerLabel, { color: mutedColor }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={{ padding: 10, paddingTop: 30 }}>
          <Text style={[styles.footerLabel, { color: mutedColor }]}>
            @reyanber . 0978344283
          </Text>
        </View>
      </SheetContent>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 0,
  },
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
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
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
});
