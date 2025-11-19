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

export const uploadProfile = async (file: string, user_id: string) => {
  const now = new Date();
  const bucketName = "Profile Pictures";
  const filePath = `${user_id}/${now
    .toString()
    .replaceAll("^[^a-zA-Z0-9s]+$", "_")}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  console.log("Upload successful:", data);
  return data;
};

type profile = {
  firstName: string;
  lastName: string;
  profilePicture: string;
};

export const updateProfile = async (profile: profile, user_id: string) => {
  const { data, error } = await supabase
    .from("profile")
    .update({
      first_name: profile.firstName,
      last_name: profile.lastName,
      profile_picture: profile.profilePicture,
    })
    .eq("user_id", user_id);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return data;
};
