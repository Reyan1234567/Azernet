import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

export type Businesses = Database["public"]["Tables"]["businesses"]["Row"];

export type getBusinessIdsT = {
  id: number;
  business_name: string;
};
export const getBusinessIds = async (
  userId: string | undefined
): Promise<getBusinessIdsT[]> => {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("user_id", userId);
  if (error) {
    throw new Error("some error occured");
  }
  return data;
};

export const businessIdExist = async (business_id_arg: number) => {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", business_id_arg);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const createBusinesses = async (
  business_name_arg: string,
  user_id_arg: number
) => {
  let { data, error } = await supabase.rpc("create_business_1", {
    business_name_arg,
    user_id_arg,
  });
  if (error) {
    throw new Error(error.message);
  } else return data;
};
