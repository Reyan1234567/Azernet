import { supabase } from "@/lib/supabase";
import { createInventory } from "./inventory";
import { createBusinessCash } from "./business_cash";
import { InventoryTypes } from "@/constants";
import { purchase } from "./purchase";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";

export const sell = async (
  itemId: number,
  partnerId: number,
  pricePerAmount: number,
  amount: number,
  unpaidAmount: number
) => {
  //Item existence check
  const item_id = await checkItemExistence(itemId);
  //Partner existence check
  await checkPartnerExistence(partnerId);
  //calculate line_total
  const lineTotal = pricePerAmount * amount;
  //create var business_id related to the item_id
  const businessId = item_id.business_id;

  //Check if inventory exists for a sell to be possible
  const amountLeft = await supabase
    .from("inventory_tracker")
    .select(`id, amountLeft:sum(item_id)`)
    .single();

  if (amountLeft.error) {
    throw new Error(amountLeft.error.message ?? "Something went wrong");
  }

  const left = Number(amountLeft.data?.amountLeft);
  if (left - amount < 0) {
    throw new Error(`Not enough Items, only ${left} are present`);
  }

  //create a sell
  const { data, error } = await supabase
    .from("sales")
    .insert({
      amount: amount,
      price_per_amount: pricePerAmount,
      unpaid_amount: unpaidAmount,
      line_total: pricePerAmount * amount,
      partner_id: partnerId,
      item_id: itemId,
    })
    .select()
    .single();

  if (data) {
    createInventory(amount, -1 * itemId);
    createBusinessCash(businessId, InventoryTypes.OUT, lineTotal);
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const reverseSale = async (id: number) => {
  const { data, error } = await supabase
    .from("sale")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      error.message ??
        "Something went wrong when trying to check sale existence"
    );
  }

  await purchase(
    data.item_id,
    data.partner_id,
    data.price_per_amount,
    data.amount,
    data.unpaid_amount
  );
};
