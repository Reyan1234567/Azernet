import { supabase } from "@/lib/supabase";

export const getProfile = async (user_id: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, profile_picture")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("IN THE GET PROFILE ERROR");
    console.log(error);
    throw new Error(error.message);
  }
  console.debug("data", data);
  return data;
};

export const uploadProfile = async (uri: string, userId: string) => {
  // 1. Convert URI to Blob directly here
  const response = await fetch(uri);
  const blob = await response.blob();

  // 2. Upload (Overwrites previous file due to upsert: true)
  const { data, error } = await supabase.storage
    .from('profile-pictures') 
    .upload(`${userId}/profile.jpg`, blob, { 
      contentType: 'image/jpeg',
      upsert: true 
    });

  if (error) throw error;

  // 3. Return just the Public URL
  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
};

export const updateProfile = async (
  profile: ProfilePayload,
  user_id: string
) => {
  // Build a partial update object so we only touch fields that have changed.
  const updateData: Record<string, unknown> = {};

  if (profile.firstName !== undefined) {
    updateData.first_name = profile.firstName;
    // Any explicit change to first name means it has been overridden.
    updateData.is_fistname_overridden = true;
  }

  if (profile.lastName !== undefined) {
    updateData.last_name = profile.lastName;
    updateData.is_lastname_overridden = true;
  }

  if (profile.profilePicture !== undefined) {
    updateData.profile_picture = profile.profilePicture;
    updateData.is_profile_pic_overridden = true;
  }

  // Nothing to update – avoid sending an empty update to Supabase.
  if (Object.keys(updateData).length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", user_id)
    .select(
      "first_name, last_name, profile_picture, is_fistname_overridden, is_lastname_overridden, is_profile_pic_overridden"
    )
    .single();

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data;
};
