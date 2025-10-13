import { supabase } from "@/lib/supabase";
import { checkItemExistence } from "./item";
import { checkPartnerExistence } from "./partners";
import { ORDERSTATUS } from "@/constants";
import { purchase, reversePurchase } from "./purchase";
import { reverseSale, sell } from "./sale";

export const createOrder = async (
  itemId: number,
  partnerId: number,
  description: string
) => {
  await checkItemExistence(itemId);
  await checkPartnerExistence(partnerId);

  const { data, error } = await supabase.from("orders").insert({
    item_id: itemId,
    partner_id: partnerId,
    description: description,
  });

  if (data) {
    return data;
  }
  throw new Error(
    error?.message ?? "Something went wrong when trying to create an order"
  );
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
    if (pending.data) {
      await reversePurchase(order.data.purchase_id);
      return pending.data;
    }
    throw new Error(
      pending.error?.message ??
        "Somethig went wrong when changing order status to pending"
    );
  }
  if (status === "purchased") {
    if (order.data.status === ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- purchas from a status:- pending or delivered"
      );
    }
    if (order.data.status === ORDERSTATUS.PENDING) {
      const pendingToPurchased = await changeOrderStatus(
        ORDERSTATUS.PURCHASED,
        id
      );
      if (pendingToPurchased.data) {
        const reversedSale = await reverseSale(order.data.sale_id);
        const ppid = await supabase.from("orders").update({ sale_id: null });
        if (ppid.error) {
          throw new Error(
            ppid.error.message ??
              "Something went wrong when updating the saleId"
          );
        }
      }
      throw new Error(
        pendingToPurchased.error?.message ??
          "Something went wrong when changing status from delivered to purchased!"
      );
    }
    const purchasedToPending = await changeOrderStatus(ORDERSTATUS.PENDING, id);
    if (purchasedToPending.data) {
      const purchaseValue = await purchase(
        order.data.item_id,
        partner!,
        pricePerAmount!,
        order.data.amount,
        unpaidAmount!
      );
      const ppid = await supabase
        .from("orders")
        .update({ purchase_id: purchaseValue.id });
      if (ppid.error) {
        throw new Error(
          ppid.error.message ??
            "Something went wrong when updating the purchasId"
        );
      }
    }
    throw new Error(
      purchasedToPending.error?.message ??
        "Something went wrong when changing status from pending to purchased!"
    );
  }
  if (status === "delivered") {
    if (order.data.status !== ORDERSTATUS.PURCHASED) {
      throw new Error(
        "Can only change to status:- delivered from a status:- purchased"
      );
    }
    const delivered = await changeOrderStatus(ORDERSTATUS.DELIVERED, id);
    if (delivered.data) {
      const saleValue = await sell(
        order.data.item_id,
        order.data.consumer_id,
        pricePerAmount!,
        order.data.amount,
        unpaidAmount!
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
      return delivered.data;
    }
    throw new Error(
      delivered.error?.message ??
        "Something went wrong when changing order status to delivered"
    );
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
//         order.data.amount,
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
//       order.data.amount,
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
