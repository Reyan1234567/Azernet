import { supabase } from "@/lib/supabase";

export const createInventory = async (action: number, itemId: number) => {
  const { error } = await supabase.from("inventory_tracker").insert({
    item_id: itemId,
    action,
  });
  if (error) {
    throw new Error(error.message);
  }
};
