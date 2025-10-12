import React, { useState } from "react";
import { FlatList, Modal } from "react-native";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/searchbar";
import { ScrollView } from "@/components/ui/scroll-view";
import { useColor } from "@/hooks/useColor";
import { Plus } from "lucide-react-native";
import renderPartnerCard from "@/components/PartnerCard";
import TopBar from "@/components/topBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemTransaction from "@/components/ItemTransaction";
import CategoryTransaction from "@/components/CategoryTransaction";

const Transactions = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toBeDeletedId, setTobeDeletedId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const bgColor = useColor("background");
  const cardBg = useColor("card");
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const primaryColor = useColor("primary");
  const borderColor = useColor("border");

  return (
    <View style={{ flex: 1, backgroundColor: bgColor}}>
      <TopBar />
      <Tabs defaultValue="items" style={{ flex: 1, padding:10 }}>
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="items" style={{ flex: 1}}>
          <ItemTransaction />
        </TabsContent>
        <TabsContent value="categories" style={{ flex: 1 }}>
          <CategoryTransaction />
        </TabsContent>
      </Tabs>
    </View>
  );
};

export default Transactions;
