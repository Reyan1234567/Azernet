import { supabase } from "@/lib/supabase";
import { checkIfInvEnough, createInventory } from "./inventory";
import { createBusinessCash } from "./business_cash";
import { InventoryTypes } from "@/constants";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";

export const sell = async (
  itemId: number,
  partnerId: number,
  pricePerItem: number,
  numberOfItems: number,
  unpaidAmount: number,
  is_deleted:boolean
) => {
  //Item existence check
  const item_id = await checkItemExistence(itemId);
  //Partner existence check
  await checkPartnerExistence(partnerId);
  //calculate line_total
  const lineTotal = pricePerItem * numberOfItems;
  //create var business_id related to the item_id
  const businessId = item_id.business_id;

  //Check if inventory exists for a sell to be possible
  const amountLeft = await checkIfInvEnough(itemId);

  const left = Number(amountLeft[0].total_item?.amountLeft);
  if (left - numberOfItems < 0) {
    throw new Error(`Not enough Items, only ${left} are present`);
  }

  //create a sell
  const { data, error } = await supabase
    .from("sales")
    .insert({
      number_of_items: numberOfItems,
      price_per_item: pricePerItem,
      unpaid_amount: unpaidAmount,
      line_total: lineTotal,
      partner_id: partnerId,
      item_id: itemId,
      is_deleted
    })
    .select()
    .single();

  if (data) {
    createInventory(
      -1 * numberOfItems,
      itemId,
      InventoryTypes.OUT,
      `Sale of item ${itemId}`
    );
    createBusinessCash(
      businessId,
      InventoryTypes.IN,
      `Sale to partner with id: ${partnerId}`,
      lineTotal
    );
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
};
