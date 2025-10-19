import { supabase } from "@/lib/supabase";

export const reversePurchase = async (id: number) => {
  const purchaseExists = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();
  if (purchaseExists.error) {
    throw new Error(
      purchaseExists.error.message ??
        "Something went wrong when trying to check purchase existence"
    );
  }
  const purchase = purchaseExists.data;
  const business = await supabase
    .from("items")
    .select("business_id")
    .eq("id", purchase.item_id)
    .single();
  console.log(business);
  //reversepurchase(businessid, isdeleted, itemid, linetotal, numberofitems, partnerid, priceperitem, purchaseid, unpaidamount)
  let { error } = await supabase.rpc("reversepurchase", {
    businessid: business.data?.business_id,
    isdeleted: true,
    itemid: purchase.item_id,
    linetotal: purchase.line_total,
    numberofitems: purchase.number_of_items,
    partnerid: purchase.partner_id,
    priceperitem: purchase.price_per_item,
    purchaseid: purchase.id,
    unpaidamount: purchase.unpaid_amount,
  });
  if (error) throw new Error(error.message);
};

export const reverseSale = async (id: number) => {
  const saleExists = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();
  if (saleExists.error) {
    throw new Error(
      saleExists.error.message ??
        "Something went wrong when trying to check sale existence"
    );
  }
  const sale = saleExists.data;
  const business = await supabase
    .from("items")
    .select("business_id")
    .eq("id", sale.item_id)
    .single();

  let { error } = await supabase.rpc("reversesell", {
    businessid: business.data?.business_id,
    isdeleted: true,
    itemid: sale.item_id,
    linetotal: sale.line_total,
    numberofitems: sale.number_of_items,
    partnerid: sale.partner_id,
    priceperitem: sale.price_per_item,
    saleid: sale.id,
    unpaidamount: sale.unpaid_amount,
  });
  if (error) {
    throw new Error(error.message);
  }
};
