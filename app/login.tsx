import { View } from "react-native";
import { Button } from "@/components/ui/button";
import React, { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { router } from "expo-router";

const Login = () => {
  const AUTH = useContext(AuthContext);
  return (
    <View>
      <Button
        onPress={() => {
          AUTH?.signInWithGoogle();
          router.replace("/");
        }}
      >
        Google Signin
      </Button>
    </View>
  );
};

export default Login;
