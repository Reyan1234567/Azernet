import { supabase } from "@/lib/supabase";
import { checkIfInvEnough, createInventory } from "./inventory";
import { createBusinessCash } from "./business_cash";
import { InventoryTypes } from "@/constants";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";

export const sell = async (
  itemId: number,
  partnerId: number | undefined,
  pricePerItem: number,
  numberOfItems: number,
  unpaidAmount: number
) => {
  if (
    !itemId ||
    !pricePerItem ||
    !numberOfItems ||
    typeof unpaidAmount !== "number"
  ) {
    throw new Error(
      "Some values necessary to create a purchase are not present!"
    );
  }
  console.log(`Number of items: ${numberOfItems}`);
  //Item existence check
  const item_id = await checkItemExistence(itemId);
  //Partner existence check
  if(partnerId)
  await checkPartnerExistence(partnerId);
  //calculate line_total
  const lineTotal = pricePerItem * numberOfItems;
  console.log(`lineTotal: ${lineTotal}`);
  //create var business_id related to the item_id
  const businessId = item_id.business_id;
  console.log(`businessId: ${businessId}`);

  //Check if inventory exists for a sell to be possible
  const amountLeft = await checkIfInvEnough(itemId);
  console.log(amountLeft);
  const left = Number(amountLeft[0].total_item);
  console.log(`left: ${left}`);
  if (left - numberOfItems < 0) {
    console.log(`Not enough Items, only ${left} are present`);
    throw new Error(`Not enough Items, only ${left} are present`);
  }

  let { data, error } = await supabase.rpc("sell", {
    businessid: businessId,
    isdeleted: false,
    itemid: itemId,
    linetotal: lineTotal,
    numberofitems: numberOfItems,
    partnerid: partnerId,
    priceperitem: pricePerItem,
    reversal: false,
    unpaidamount: unpaidAmount,
  });
  if (error) throw new Error(error?.message ?? "Something went wrong");
  else return data;
};


export const subtractUnpaidAmountSales = async (
  id: number,
  amountToSubtract: number
) => {
  const { data:unpaidAmountData, error } = await supabase
    .from("sales")
    .select("unpaid_amount")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      "Error happened when getting the sales: related to the unpaidAmount..."
    );
  }
  if (amountToSubtract > unpaidAmountData.unpaid_amount) {
    throw new Error("Amount to subtract is more than");
  }

  let { data: rpcData, error: rpcError } = await supabase.rpc(
    "pay_for_due_sale_payment",
    {
      amount:amountToSubtract,
      _id:id,
    }
  );
  if (rpcError)
    throw new Error("Error happended when subtracting unpaidAmount");
  else return rpcData;
};