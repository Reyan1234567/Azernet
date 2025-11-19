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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<profileData>({
    resolver: zodResolver(formData),
    defaultValues: {
      firstName: AUTH.profile.firstName,
      lastName: AUTH.profile.lastName,
      profilePic: "",
    },
  });
  const [image, setImage] = useState(AUTH.profile.profilePic);
  const onSubmit = async (data: profileData) => {
    console.log(data);
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
          />
        )}
      />

      <View style={{ marginTop: 30 }}>
        <Button
          disabled={!isDirty}
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
