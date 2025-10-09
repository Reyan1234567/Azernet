import { StyleSheet } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
// import SearchSelect from '@/components/SearchSelect'

const Index = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text variant="heading">Welcome to BNA UI</Text>
      <Button onPress={() => router.push("/createTransaction")}>
        GO BITCHAANIGGA
      </Button>
      <Button onPress={() => router.push("/createItem")}>
        GO BITCHAANIGGA
      </Button>

      {/* <Button onPress={() => router.push("/(drawer)/home")}> */}
      {/* Go to Drawer */}
      {/* </Button> */}
      <View style={styles.componentsContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  componentsContainer: {
    gap: 30,
  },
});

export default Index;
