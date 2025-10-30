import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import React, { useContext } from "react";
import { AuthContext } from "@/context/authContext";

const Login = () => {
  const AUTH = useContext(AuthContext);
  return (
    <View>
      <Button onPress={() => AUTH?.signInWithGoogle()}>Google Signin</Button>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});
