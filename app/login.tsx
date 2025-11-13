import { Button } from "@/components/ui/button";
import React from "react";
import { useAuth } from "@/context/authContext";
import { router } from "expo-router";
import { statusCodes } from "@react-native-google-signin/google-signin";
import SnackBarToast from "@/components/SnackBarToast";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";

const Login = () => {
  const AUTH = useAuth();
  const handleGoogleAuth = () => {
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
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Image
        source={{
          uri: "https://i.pinimg.com/1200x/df/51/ba/df51bae01cd310b9012c8b65de3c6b2f.jpg",
        }}
        variant="circle"
        width={150}
        aspectRatio={1}
      />
      <Text variant="caption" style={{fontSize:15}}>Manage your expences with Azernet</Text>
      <Button style={{}} onPress={handleGoogleAuth}>
        Get Started With Google
      </Button>
    </SafeAreaView>
  );
};

export default Login;
