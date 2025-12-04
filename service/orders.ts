import { supabase } from "@/lib/supabase";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";
import { ORDERSTATUS } from "@/constants";

export const createOrder = async (
  itemId: number,
  partnerId: number,
  description: string,
  numberOfItems: number
) => {
  await checkItemExistence(itemId);
  await checkPartnerExistence(partnerId);

  const { data, error } = await supabase
    .from("orders")
    .insert({
      item_id: itemId,
      consumer_id: partnerId,
      description: description,
      number_of_items: numberOfItems,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      error?.message ?? "Something went wrong when trying to create an order"
    );
  }
  return data;
};

export const changeStatus = async (
  status: string,
  id: number,
  pricePerAmount?: number,
  unpaidAmount?: number,
  partner?: number
) => {
  const order = await supabase.from("orders").select("*").eq("id", id).single();
  if (order.error) {
    throw new Error(
      order.error.message ??
        "Something went wrong when checking an order's existence"
    );
  }
  console.log(order.data);
  const business = await supabase
    .from("items")
    .select("*")
    .eq("id", order.data.item_id)
    .single();

  console.log("Bussiness ID: " + business.data.business_id);

  if (status === ORDERSTATUS.PENDING) {
    if (order.data.status !== ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- pending from a status:- purchased"
      );
    }

    let purchase = await supabase
      .from("purchases")
      .select("*")
      .eq("id", order.data.purchase_id)
      .single();

    if (purchase.error)
      throw new Error(
        purchase.error?.message ??
          "Something went wrong when checking an order's purchase"
      );

    let reverseordertopending = await supabase.rpc("reverseordertopending", {
      businessid: business.data.business_id,
      itemid: purchase.data.item_id,
      linetotal: purchase.data.line_total,
      numberofitems: purchase.data.number_of_items,
      order_id: order.data.id,
      partnerid: purchase.data.partner_id,
      priceperitem: purchase.data.price_per_item,
      purchase_id: purchase.data.id,
      unpaidamount: purchase.data.unpaid_amount,
    });
    if (reverseordertopending.error)
      throw new Error(
        reverseordertopending.error?.message ??
          "Something went wrong when reversing order to pending"
      );
  }
  if (status === ORDERSTATUS.PURCHASED) {
    if (order.data.status === ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- purchas from a status:- pending or delivered"
      );
    }

    if (order.data.status === ORDERSTATUS.PENDING) {
      if (!pricePerAmount || !partner) {
        throw new Error("pricePerItem or partner weren't provided!");
      }
      let { error } = await supabase.rpc("markaspurchased", {
        business_id: business.data.business_id,
        item_id: order.data.item_id,
        line_total: pricePerAmount! * order.data.number_of_items,
        number_of_items: order.data.number_of_items,
        order_id: order.data.id,
        partner_id: partner,
        price_per_item: pricePerAmount,
        unpaid_amount: unpaidAmount,
      });
      if (error) {
        throw new Error(
          error.message ??
            `Something went wrong when marking order with id: ${order.data.id} as purchased`
        );
      }
    } else {
      const sale = await supabase
        .from("sales")
        .select("*")
        .eq("id", order.data.sale_id)
        .single();
      if (sale.error) {
        throw new Error(
          sale.error.message ??
            `Something went wrong when checking order with id: ${order.data.id}`
        );
      }
      let { error } = await supabase.rpc("reverseordertopurchased", {
        businessid: business.data.business_id,
        itemid: sale.data.item_id,
        linetotal: sale.data.line_total,
        numberofitems: sale.data.number_of_items,
        order_id: order.data.id,
        partnerid: sale.data.partner_id,
        priceperitem: sale.data.price_per_item,
        purchase_id: sale.data.id,
        unpaidamount: sale.data.unpaid_amount,
      });
      if (error) {
        throw new Error(
          error.message ??
            `Something went wrong when reversing sale with id: ${sale.data.id}`
        );
      }
    }
  }
  if (status === "delivered") {
    if (!pricePerAmount) {
      throw new Error("pricePerItem wasn't provided!");
    }
    let { error } = await supabase.rpc("markasdelivered", {
      business_id: business.data.business_id,
      item_id: order.data.item_id,
      line_total: pricePerAmount * order.data.number_of_items,
      number_of_items: order.data.number_of_items,
      order_id: order.data.id,
      partner_id: order.data.consumer_id,
      price_per_item: pricePerAmount,
      unpaid_amount: unpaidAmount,
    });
    if (error) {
      throw new Error(
        error.message ??
          `Something went wrong when marking order with id: ${order.data.id} as delivered`
      );
    }
  }
};

export const getAllOrders = async (
  business_id_args: number,
  search: string,
  filter: string
) => {
  let { data, error } = await supabase.rpc("getallorders", {
    business_id_args,
    filter,
    search,
  });
  if (error) {
    throw new Error(
      error.message ?? "Something went wrong when getting All orders"
    );
  } else return data;
};

export const deleteOrder = async (id: number) => {
  const check = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("status", "pending");

  if (check.error) {
    throw new Error("Order not found");
  }
  const { data, error } = await supabase
    .from("orders")
    .update({ is_deleted: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message ?? "Something went wrong when trying to delete order"
    );
  }
  return data;
};

export const getNumberOfItems = async (id: number) => {
  const { data, error } = await supabase
    .from("orders")
    .select("number_of_items")
    .eq("id", id)
    .single();

  if (error) {
    return;
  }
  return data;
};
