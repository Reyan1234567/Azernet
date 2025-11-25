import { supabase } from "@/lib/supabase";

export const getPurchases = async (businessId: number, date: Date) => {
  let { data:allFilteredPurcahses, error } = await supabase.rpc("get_purchases_1", {
    businessId,
    date,
  });
  if (error) {
    throw new Error(error.message);
  }
  
  return allFilteredPurcahses;
};
