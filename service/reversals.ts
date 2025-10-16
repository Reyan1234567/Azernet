import { supabase } from "@/lib/supabase";
import { sell } from "./sale";
import { purchase } from "./purchase";

export const reversePurchase = async (id: number) => {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      error.message ??
        "Something went wrong when trying to check purchase existence"
    );
  }

  const update = await supabase
    .from("purchases")
    .update({ is_deleted: true })
    .eq("id", id);

  if (update.error) {
    throw new Error("Something went wrong when trying to delete purchase");
  }
  console.log(data)
  await sell(
    data.item_id,
    data.partner_id,
    data.price_per_item,
    data.number_of_items,
    data.unpaid_amount,
    true
  );
};

export const reverseSale = async (id: number) => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      error.message ??
        "Something went wrong when trying to check sale existence"
    );
  }

  const update = await supabase
    .from("sales")
    .update({ is_deleted: true })
    .eq("id", id);

  if (update.error) {
    throw new Error("Something went wrong when trying to delete purchase");
  }
  console.log(data.price_per_item);
  console.log(data)
  
  await purchase({
    itemId: data.item_id,
    partnerId: data.partner_id,
    pricePerItem: data.price_per_item,
    numberOfItems: data.number_of_items,
    unpaidAmount: data.unpaid_amount,
    is_deleted: true,
  });
};
