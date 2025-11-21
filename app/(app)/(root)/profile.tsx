import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, View, Platform } from "react-native";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/ui/media-picker";
import SnackBarToast from "@/components/SnackBarToast";
import { ImageIcon } from "lucide-react-native";

// Form & Validation
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Logic & Context
import { useAuth } from "@/context/authContext";
import { updateProfile, uploadProfile } from "@/service/profile";
import { uriToBlob } from "@/utils/blob";

// 1. Define Schema outside component to prevent re-creation on render
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // We store the actual BLOB file here, optional because user might not change it
  newImageFile: z.any().optional(), 
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { profile, session, refetchProfile } = useAuth();

  // 2. Local state ONLY for displaying the image preview (URI string)
  // The actual file data (Blob) lives inside React Hook Form
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
    },
  });

  // Update form/preview if the Auth Context loads data late
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      setPreviewImage(profile.profilePic);
    }
  }, [profile, reset]);

  const handleImageSelection = async (assets: any[]) => {
    if (!assets || assets.length === 0) return;

    const selectedUri = assets[0].uri;

    try {
      // Update UI immediately
      setPreviewImage(selectedUri);

      // Convert to Blob for the form
      const blob = await uriToBlob(selectedUri);
      
      // Register with form so 'isDirty' becomes true
      setValue("newImageFile", blob, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      console.error("Error processing image:", error);
      SnackBarToast({ message: "Could not process image", isSuccess: false });
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) return;

    try {
      let finalProfilePicPath = profile?.profilePic; // Default to existing

      // 3. Step 1: Upload Image (Only if a new file exists in form data)
      if (data.newImageFile) {
        const uploadRes = await uploadProfile(
          data.newImageFile,
          session.user.id
        );
        
        if (!uploadRes?.fullPath) {
          throw new Error("Image upload failed");
        }
        finalProfilePicPath = uploadRes.fullPath;
      }

      // 4. Step 2: Update Database Profile
      // Only send fields that actually changed; the service layer will mark
      // the corresponding "is_*_overridden" flags as true.
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
        width: "100%"
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
        <MediaPicker
          mediaType="image"
          buttonText="Change Photo"
          icon={ImageIcon}
          variant="outline"
          onSelectionChange={handleImageSelection}
        />
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

      <View style={{marginTop:"auto", marginBottom:50}}>
        <Button
          disabled={!isDirty || isSubmitting}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={{ width: "100%", paddingVertical: 12}}
        >
          Save Changes
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Profile;