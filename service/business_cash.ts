import { supabase } from "@/lib/supabase";

export const createBusinessCash = async (
  businessId: number,
  type: string,
  amount: number
) => {
  const business = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId);

  if (business.error) {
    if (business.error.code === "02000") {
      throw new Error(`No business with id: ${businessId} was found!`);
    }
    throw new Error("Something went wrong when checking a business id");
  }

  const { data, error } = await supabase.from("business_cash").insert({
    business_id: businessId,
    type,
    amount,
  });

  if (data) {
    return data;
  }
  throw new Error(
    error?.message ?? "Something went wrong when creating a business_cash"
  );
};
