import React, { useState } from "react";
import { KeyboardAvoidingView, View, Platform } from "react-native";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import { decode } from 'base64-arraybuffer'; 

import SnackBarToast from "@/components/SnackBarToast";
import { ImageIcon } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/context/authContext";
import { updateProfile, uploadProfile } from "@/service/profile";
import { useColor } from "@/hooks/useColor";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  newImageFile: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const textColor = useColor("text");
  const { profile, session, refetchProfile } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    profile?.profilePic
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      newImageFile: undefined,
    },
  });

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      SnackBarToast({
        message: "Permission to access the media library is required.",
        isSuccess: false,
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      if (result.assets.length === 0 || !result.assets[0].base64) {
        return;
      }
      setValue("newImageFile", result.assets[0], {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
      setPreviewImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) return;

    try {
      let finalProfilePicPath = profile?.profilePic;
      if (data.newImageFile) {
        console.log("NEW IMAGE")
        console.log(data.newImageFile.uri)
        const uploadRes = await uploadProfile(
          decode(data.newImageFile.base64),
          session.user.id,
          data.newImageFile.fileName
        );

        if (!uploadRes) {
          throw new Error("Image upload failed");
        }
        finalProfilePicPath = uploadRes;
      }

      const payload: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
      } = {};

      if (data.firstName !== profile?.firstName) {
        payload.firstName = data.firstName;
      }

      if (data.lastName !== profile?.lastName) {
        payload.lastName = data.lastName;
      }

      if (finalProfilePicPath !== profile?.profilePic) {
        payload.profilePicture = finalProfilePicPath ?? "";
      }

      await updateProfile(payload, session.user.id);

      // 5. Step 3: Refresh Global State
      await refetchProfile();

      // Reset form 'dirty' state with new values
      reset(data);

      SnackBarToast({
        message: "Profile updated successfully",
        isSuccess: true,
      });
    } catch (error) {
      console.error("Update error:", error);
      SnackBarToast({
        message: "Failed to update profile",
        isSuccess: false,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
        width: "100%",
      }}
    >
      <View style={{ alignItems: "center", gap: 12, marginBottom: 10 }}>
        <Image
          source={{ uri: previewImage }}
          variant="circle"
          width={150}
          aspectRatio={1}
          alt="Profile Picture"
        />
        <Button
          variant="outline"
          onPress={() => {
            pickImage();
          }}
        >
          <Text style={{ color: textColor }}>Change Profile</Text>
          <ImageIcon color={textColor} />
        </Button>{" "}
      </View>

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value } }) => (
          <Input
            label="First Name"
            onChangeText={onChange}
            value={value}
            error={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Last Name"
            onChangeText={onChange}
            value={value}
            error={errors.lastName?.message}
          />
        )}
      />

      <View style={{ marginTop: "auto", marginBottom: 50 }}>
        <Button
          disabled={!isDirty || isSubmitting}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={{ width: "100%", paddingVertical: 12 }}
        >
          Save Changes
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Profile;
