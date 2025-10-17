import { supabase } from "@/lib/supabase";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";
import { ORDERSTATUS } from "@/constants";
import { purchase } from "./purchase";
import { sell } from "./sale";
import { reversePurchase, reverseSale } from "./reversals";

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
  if (status === ORDERSTATUS.PENDING) {
    if (order.data.status !== ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- pending from a status:- purchased"
      );
    }
    const pending = await changeOrderStatus(ORDERSTATUS.PENDING, id);
    if (pending.error) {
      throw new Error(
        pending.error?.message ??
          "Somethig went wrong when changing order status to pending"
      );
    }
    await reversePurchase(order.data.purchase_id);
    const nullifyPurchase = await supabase
      .from("orders")
      .update({ purchase_id: null })
      .eq("id", id);

    if (nullifyPurchase.error) {
      throw new Error(
        nullifyPurchase.error.message ??
          "Something went wrong when nullifying purchase_id"
      );
    }
    await changeOrderStatus(ORDERSTATUS.PENDING, id);
    return pending.data;
  }
  if (status === ORDERSTATUS.PURCHASED) {
    if (order.data.status === ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- purchas from a status:- pending or delivered"
      );
    }
    if (order.data.status === ORDERSTATUS.PENDING) {
      const purchaseValue = await purchase({
        itemId: order.data.item_id,
        partnerId: partner!,
        pricePerItem: pricePerAmount!,
        numberOfItems: order.data.number_of_items,
        unpaidAmount: unpaidAmount!,
        is_deleted: false,
      });
      const ppid = await supabase
        .from("orders")
        .update({ purchase_id: purchaseValue.id })
        .eq("id", id);

      if (ppid.error) {
        throw new Error(
          ppid.error.message ??
            "Something went wrong when updating the purchasId"
        );
      }
      const pendingToPurchased = await changeOrderStatus(
        ORDERSTATUS.PURCHASED,
        id
      );
      if (pendingToPurchased.error) {
        throw new Error(
          pendingToPurchased.error?.message ??
            "Something went wrong when changing status from pending to purchased!"
        );
      }
    } else {
      await reverseSale(order.data.sale_id);
      const ppid = await supabase
        .from("orders")
        .update({ sale_id: null })
        .eq("id", id);
      if (ppid.error) {
        throw new Error(
          ppid.error.message ?? "Something went wrong when updating the saleId"
        );
      }
      const deliveredToPurchased = await changeOrderStatus(
        ORDERSTATUS.PURCHASED,
        id
      );
      if (deliveredToPurchased.error) {
        throw new Error(
          deliveredToPurchased.error?.message ??
            "Something went wrong when changing status from delivered to purchased!"
        );
      }
    }
  }
  if (status === "delivered") {
    if (order.data.status !== ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- delivered from a status:- purchased"
      );
    }
    const saleValue = await sell(
      order.data.item_id,
      order.data.consumer_id,
      pricePerAmount!,
      order.data.number_of_items,
      unpaidAmount!,
      false
    );
    const saleIdUpdate = await supabase
      .from("orders")
      .update({ sale_id: saleValue.data.id })
      .eq("id", id);
    if (saleIdUpdate.error) {
      throw new Error(
        saleIdUpdate.error.message ??
          "Something went wrong when updating the saleId"
      );
    }
    const delivered = await changeOrderStatus(ORDERSTATUS.DELIVERED, id);
    if (delivered.error) {
      throw new Error(
        delivered.error?.message ??
          "Something went wrong when changing order status to delivered"
      );
    }
    return delivered.data;
  }
};

export const changeOrderStatus = async (status: string, id: number) => {
  return await supabase.from("orders").update({ status: status }).eq("id", id);
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

//export const changeStatus = async (
//   status: string,
//   id: number,
//   pricePerAmount?: number,
//   unpaidAmount?: number,
//   partner?: number
// ) => {
//   const order = await supabase.from("orders").select("*").eq("id", id).single();
//   if (order.error) {
//     throw new Error(
//       order.error.message ??
//         "Something went wrong when checking an order's existence"
//     );
//   }

//   // Pending
//   if (status === ORDERSTATUS.PENDING) {
//     if (order.data.status !== ORDERSTATUS.PURCHASED) {
//       throw new Error(
//         "Can only change to status:- pending from a status:- purchased"
//       );
//     }
//     const pending = await changeOrderStatus(ORDERSTATUS.PENDING, id);
//     if (pending.error) {
//       throw new Error(
//         pending.error.message ??
//           "Something went wrong when changing order status to pending"
//       );
//     }
//     await reversePurchase(order.data.purchase_id);
//     return pending.data;
//   }

//   // Purchased
//   if (status === ORDERSTATUS.PURCHASED) {
//     if (order.data.status === ORDERSTATUS.PURCHASED) {
//       throw new Error(
//         "Can only change to status:- purchased from a status:- pending or delivered"
//       );
//     }
//     if (order.data.status === ORDERSTATUS.PENDING) {
//       const pendingToPurchased = await changeOrderStatus(ORDERSTATUS.PURCHASED, id);
//       if (pendingToPurchased.error) {
//         throw new Error(
//           pendingToPurchased.error.message ??
//             "Something went wrong when changing status from pending to purchased!"
//         );
//       }
//       await reverseSale(order.data.sale_id);
//       const ppid = await supabase.from("orders").update({ sale_id: null }).eq("id", id);
//       if (ppid.error) {
//         throw new Error(
//           ppid.error.message ??
//             "Something went wrong when updating the saleId"
//         );
//       }
//       return pendingToPurchased.data;
//     }
//     // From delivered to purchased
//     if (
//       order.data.status === ORDERSTATUS.DELIVERED &&
//       partner != null &&
//       pricePerAmount != null &&
//       unpaidAmount != null
//     ) {
//       const purchasedToPending = await changeOrderStatus(ORDERSTATUS.PENDING, id);
//       if (purchasedToPending.error) {
//         throw new Error(
//           purchasedToPending.error.message ??
//             "Something went wrong when changing status from delivered to purchased!"
//         );
//       }
//       const purchaseValue = await purchase(
//         order.data.item_id,
//         partner,
//         pricePerAmount,
//         order.data.number_of_items,
//         unpaidAmount
//       );
//       const ppid = await supabase
//         .from("orders")
//         .update({ purchase_id: purchaseValue.id })
//         .eq("id", id);
//       if (ppid.error) {
//         throw new Error(
//           ppid.error.message ??
//             "Something went wrong when updating the purchaseId"
//         );
//       }
//       return purchasedToPending.data;
//     }
//     throw new Error(
//       "Missing required parameters for changing status from delivered to purchased!"
//     );
//   }

//   // Delivered
//   if (status === ORDERSTATUS.DELIVERED) {
//     if (order.data.status !== ORDERSTATUS.PURCHASED) {
//       throw new Error(
//         "Can only change to status:- delivered from a status:- purchased"
//       );
//     }
//     if (
//       pricePerAmount == null ||
//       unpaidAmount == null ||
//       order.data.consumer_id == null
//     ) {
//       throw new Error("Missing required parameters for delivery!");
//     }
//     const delivered = await changeOrderStatus(ORDERSTATUS.DELIVERED, id);
//     if (delivered.error) {
//       throw new Error(
//         delivered.error.message ??
//           "Something went wrong when changing order status to delivered"
//       );
//     }
//     const saleValue = await sell(
//       order.data.item_id,
//       order.data.consumer_id,
//       pricePerAmount,
//       order.data.number_of_items,
//       unpaidAmount
//     );
//     const saleIdUpdate = await supabase
//       .from("orders")
//       .update({ sale_id: saleValue.data.id })
//       .eq("id", id);
//     if (saleIdUpdate.error) {
//       throw new Error(
//         saleIdUpdate.error.message ??
//           "Something went wrong when updating the saleId"
//       );
//     }
//     return delivered.data;
//   }

//   throw new Error("Invalid status transition requested.");
// };
