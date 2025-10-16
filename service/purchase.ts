import { supabase } from "@/lib/supabase";
import { createInventory } from "./inventory";
import { checkIfEnough, createBusinessCash } from "./business_cash";
import { InventoryTypes } from "@/constants";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";

type purchaseInput = {
  itemId: number;
  partnerId: number;
  pricePerItem: number;
  numberOfItems: number;
  unpaidAmount: number;
  is_deleted:boolean
};
export const purchase = async ({
  itemId,
  partnerId,
  pricePerItem,
  numberOfItems,
  unpaidAmount,
  is_deleted
}: purchaseInput) => {
  //Item existence check
  const item_id = await checkItemExistence(itemId);
  //Partner existence check
  await checkPartnerExistence(partnerId);
  //calculate line_total
  const lineTotal = pricePerItem * numberOfItems;
  //create var business_id related to the item_id
  const businessId = item_id.business_id;
  //check if there is enough cash to fund the purchase
  const cashCheck = await checkIfEnough(businessId);

  if (cashCheck[0].total_money - lineTotal < 0) {
    throw new Error("You don't have enough assets to fund this purchase!");
  }
  //create a purchase
  const { data, error } = await supabase
    .from("purchases")
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
      numberOfItems,
      itemId,
      InventoryTypes.IN,
      `Purchase of item ${itemId}`
    );
    createBusinessCash(
      businessId,
      InventoryTypes.OUT,
      `Purchase from partner with id: ${partnerId}`,
      -1*lineTotal
    );
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
};
