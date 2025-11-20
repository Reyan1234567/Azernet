import { KeyboardAvoidingView, View } from "react-native";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { useColor } from "@/hooks/useColor";
import { useAuth } from "@/context/authContext";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaPicker } from "@/components/ui/media-picker";
import { ImageIcon } from "lucide-react-native";
import { uriToBlob } from "@/utils/blob";
import { updateProfile, uploadProfile } from "@/service/profile";
import SnackBarToast from "@/components/SnackBarToast";

const Profile = () => {
  const formData = z.object({
    firstName: z.string().min(1, "this field can't be empty"),
    lastName: z.string().min(1, "this field can't be empty"),
    profilePic: z.string(),
  });

  type profileData = z.infer<typeof formData>;
  const AUTH = useAuth();
  console.log("THE AUTH PROFILE", AUTH.profile.firstName);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<profileData>({
    resolver: zodResolver(formData),
    defaultValues: {
      firstName: AUTH.profile.firstName,
      lastName: AUTH.profile.lastName,
      profilePic: AUTH.profile.profilePic,
    },
  });
  const [image, setImage] = useState(AUTH.profile.profilePic);
  const onSubmit = async (data: profileData) => {
    console.log("DATA",data);
    try {
      if (data.profilePic) {
        const res = await uploadProfile(
          data.profilePic,
          AUTH?.session?.user?.id ?? ""
        );
        await updateProfile(
          { ...data, profilePicture: res?.fullPath ?? "" },
          AUTH.session?.user.id ?? ""
        );
      } else {
        await updateProfile(
          { ...data, profilePicture: AUTH.profile.profilePic },
          AUTH.session?.user.id ?? ""
        );
      }
      SnackBarToast({
        message: "Profile updated successfully",
        isSuccess: true,
      });
    } catch (error) {
      console.log(error);
      SnackBarToast({
        message: "Failed to update profile",
        isSuccess: false,
      });
    }
  };
  return (
    <KeyboardAvoidingView
      style={{
        flexDirection: "column",
        gap: 10,
        alignItems: "stretch",
        padding: 16,
        width: "100%",
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Image
          source={{
            uri: image,
          }}
          variant="circle"
          width={150}
          aspectRatio={1}
        />
      </View>
      <MediaPicker
        mediaType="image"
        buttonText="Change Profile"
        icon={ImageIcon}
        variant="outline"
        onSelectionChange={(assets) => {
          const setValues = async () => {
            const picFile = await uriToBlob(assets[0].uri);
            console.log(picFile)
            setValue("profilePic", picFile);
            setImage(assets[0].uri);
            console.log("Selected images:", assets);
          };
          setValues();
        }}
      />
      <Controller
        control={control}
        name="firstName"
        render={({ field }) => (
          <Input
            label="First Name"
            onChangeText={field.onChange}
            value={field.value}
            error={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field }) => (
          <Input
            label="Last Name"
            onChangeText={field.onChange}
            value={field.value}
            error={errors.lastName?.message}
          />
        )}
      />

      <View style={{ marginTop: 30 }}>
        <Button
          disabled={!isDirty && getValues("profilePic")===AUTH.profile.profilePic}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={{ width: "100%", paddingVertical: 12 }}
        >
          Save
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Profile;
