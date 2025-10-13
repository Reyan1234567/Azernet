import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import React from "react";

const FundBusiness = () => {
  const textColor = useColor("text");
  const mutedColor = useColor("textMuted");
  return (
    <Card style={{ padding: 20,}}>
      <CardHeader style={{ alignItems: "center" }}>
        <CardTitle style={{ color: textColor, fontSize: 22, marginBottom: 4 }}>
          Fund Your Business
        </CardTitle>
        <CardDescription
          style={{
            color: mutedColor,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Add funds to your business account to enable purchases and operations.
        </CardDescription>
      </CardHeader>
      <Button style={{ width: "100%" }}>Fund</Button>
    </Card>
  );
};

export default FundBusiness;
