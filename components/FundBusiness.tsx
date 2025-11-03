import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useContext } from "react";
import { View } from "react-native";
import { Separator } from "./ui/separator";
import { Text } from "../components/ui/text";
import { Skeleton } from "./ui/skeleton";
import { getSumMoney } from "@/service/business_cash";
import { BusinessContext } from "@/context/businessContext";

const FundBusiness = () => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  const red = useColor("red");
  const BUSINESS = useContext(BusinessContext);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["sumMoney", BUSINESS?.businessId],
    queryFn: () => getSumMoney(BUSINESS?.businessId),
  });
  return (
    <Card style={{ padding: 20 }}>
      <CardHeader style={{ alignItems: "center" }}>
        <CardTitle style={{ color: textColor, fontSize: 22, marginBottom: 4 }}>
          Manage Business Assets
        </CardTitle>
        <CardDescription
          style={{
            color: mutedColor,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Manage the assets in your business, you can either withdraw or deposit
          money. Later to make purchases we look if you have enough money here.
        </CardDescription>
      </CardHeader>
      <View style={{ flexDirection: "column", gap: 10 }}>
        <Separator />
        <Text variant="caption" style={{ textAlign: "center" }}>
          You currently have
        </Text>

        {isLoading ? (
          <View
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Skeleton width={200} height={35} />
          </View>
        ) : isSuccess ? (
          <Text
            variant="title"
            style={{
              color: textColor,
              textAlign: "center",
              fontSize: 35,
              paddingBottom: 10,
            }}
          >
            {data
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "ETB",
                }).format(data)
              : 0.0}
          </Text>
        ) : (
          <Text style={{ textAlign: "center", color: red }}>
            Connect to the internet and try again
          </Text>
        )}
        <Button style={{ width: "100%" }} onPress={() => router.push("/fund")}>
          Deposit
        </Button>
        <Button
          style={{ width: "100%" }}
          onPress={() => router.push("/withdraw")}
        >
          Withdraw
        </Button>
      </View>
    </Card>
  );
};

export default FundBusiness;
