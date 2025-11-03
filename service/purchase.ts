import { supabase } from "@/lib/supabase";
import { checkIfEnough } from "./business_cash";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";

type purchaseInput = {
  itemId: number;
  partnerId: number;
  pricePerItem: number;
  numberOfItems: number;
  unpaidAmount: number;
};
export const purchase = async ({
  itemId,
  partnerId,
  pricePerItem,
  numberOfItems,
  unpaidAmount,
}: purchaseInput) => {
  console.log("Entering purchase function with params:", {
    itemId,
    partnerId,
    pricePerItem,
    numberOfItems,
    unpaidAmount,
  });
  if (
    !itemId ||
    !partnerId ||
    !pricePerItem ||
    !numberOfItems ||
    typeof unpaidAmount !== "number"
  ) {
    throw new Error(
      "Some values necessary to create a purchase are not present!"
    );
  }
  console.log("Input validation passed");
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

  if (cashCheck - lineTotal < 0) {
    throw new Error("You don't have enough assets to fund this purchase!");
  }
  //create a purchase
  console.log("About to create purchase record");
  let { data, error } = await supabase.rpc("purchase", {
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
  if (error) {
    console.log(error.message);
    throw new Error(error?.message ?? "Something went wrong");
  } else return data;
};

export const subtractUnpaidAmountPurchase = async (
  id: number,
  amountToSubtract: number
) => {
  const { data:unpaidAmountData, error } = await supabase
    .from("purchases")
    .select("unpaid_amount")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(
      "Error happened when getting the purchase: related to the unpaidAmount..."
    );
  }
  if (amountToSubtract > unpaidAmountData.unpaid_amount) {
    throw new Error("Amount to subtract is more than");
  }

  let { data: rpcData, error: rpcError } = await supabase.rpc(
    "pay_for_due_purchase_payment",
    {
      amount:amountToSubtract,
      _id:id,
    }
  );
  if (rpcError)
    throw new Error("Error happended when subtracting unpaidAmount");
  else return rpcData;
};
