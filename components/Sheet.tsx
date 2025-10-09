import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import React, { useState } from "react";

interface sheetInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function SheetLeft({ open, setOpen }: sheetInterface) {
  return (
    <Sheet open={open} onOpenChange={setOpen} side="left">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Left Side Sheet</SheetTitle>
          <SheetDescription>
            This sheet slides in from the left side of the screen.
          </SheetDescription>
        </SheetHeader>
        <View style={{ padding: 24, gap: 16 }}>
          <Text>
            Left-side sheets are commonly used for navigation menus and primary
            actions that need to be easily accessible.
          </Text>
          <Button onPress={() => setOpen(false)}>Close Sheet</Button>
        </View>
      </SheetContent>
    </Sheet>
  );
}
