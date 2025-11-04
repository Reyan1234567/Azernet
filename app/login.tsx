import { View } from "react-native";
import { Button } from "@/components/ui/button";
import React from "react";
import { useAuth } from "@/context/authContext";
import { router } from "expo-router";
import { statusCodes } from "@react-native-google-signin/google-signin";
import SnackBarToast from "@/components/SnackBarToast";

const Login = () => {
  const AUTH = useAuth();
  return (
    <View>
      <Button
        onPress={() => {
          try {
            AUTH?.signInWithGoogle();
            router.replace("/");
          } catch (error: any) {
            if (error.code === statusCodes.IN_PROGRESS) {
              SnackBarToast({
                message: "Authentication Already in progress!",
                isSuccess: false,
                marginBottom: length,
              });
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              SnackBarToast({
                message: "Play services not available or outdated!",
                isSuccess: false,
                marginBottom: length,
              });
            } else {
              SnackBarToast({
                message: "Couldn't authenticate your!",
                isSuccess: false,
                marginBottom: length,
              });
            }
          }
        }}
      >
        Google Signin
      </Button>
    </View>
  );
};

export default Login;
