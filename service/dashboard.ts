import { supabase } from "@/lib/supabase";

export const getDashboardData = async (
  business_id: number | null | undefined,
  last_time: Date
) => {
  if (!business_id) {
    throw new Error("no BusinessId");
  }
  let { data, error } = await supabase.rpc("dashboard_1", {
    business_id,
    last_time,
  });
  if (error) {
    throw new Error(error.message);
  } else return data;
};
