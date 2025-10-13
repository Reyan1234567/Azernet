import { supabase } from "@/lib/supabase";
import { createInventory } from "./inventory";
import { createBusinessCash } from "./business_cash";
import { InventoryTypes } from "@/constants";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";
import { sell } from "./sale";

export const purchase = async (
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
  //check if there is enough cash to fund the purchase
  const cashCheck = await supabase
    .from("business_cash")
    .select(`id, net:sum(amount)`)
    .eq("business_id", businessId)
    .single();

  if (cashCheck.error) {
    throw new Error(
      cashCheck.error.message ?? "Something when checking for cash went wrong!"
    );
  }
  const cashCheckValue = Number(cashCheck.data.net);
  if (cashCheckValue - lineTotal < 0) {
    throw new Error("You don't have enough assets to fund this purchase!");
  }
  //create a purchase
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      amount: amount,
      price_per_amount: pricePerAmount,
      unpaid_amount: unpaidAmount,
      line_total: lineTotal,
      partner_id: partnerId,
      item_id: itemId,
    })
    .select()
    .single();

  if (data) {
    createInventory(amount, -1 * itemId);
    createBusinessCash(businessId, InventoryTypes.IN, lineTotal);
    return data;
  }
  throw new Error(error.message ?? "Something went wrong");
};

export const reversePurchase = async (id: number) => {
  const { data, error } = await supabase
    .from("purchase")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      error.message ??
        "Something went wrong when trying to check purchase existence"
    );
  }

  await sell(
    data.item_id,
    data.partner_id,
    data.price_per_amount,
    data.amount,
    data.unpaid_amount
  );
};
