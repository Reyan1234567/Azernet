import { supabase } from "@/lib/supabase";

export const createInventory = async (
  action: number,
  itemId: number,
  type: string,
  description: string
) => {
  const { error } = await supabase.from("inventory_tracker").insert({
    item_id: itemId,
    action,
    type,
    description,
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const checkIfInvEnough = async (item_id_arg: number) => {
  let { data, error } = await supabase.rpc("checkifenoughinventory", {
    item_id_arg,
  });
  if (error) {
    throw new Error(
      error.message ??
        `Something went wrong when checking if Inventory was enough for id ${item_id_arg}`
    );
  }
  return data;
};
