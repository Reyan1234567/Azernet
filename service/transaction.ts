import { CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export type ItemTransactionDisplay = {
  transaction_id: number;
  amount: number;
  price_per_amount: number;
  unpaid_amount: number;
  status: string;
  created_at: string;
  line_total: number;
  partner_first_name: string;
  partner_last_name: string;
  item_name: string;
};

export type CategoryTransactionDisplay = {
  transaction_id: number;
  amount: number;
  price_per_amount: number;
  unpaid_amount: number;
  status: string;
  created_at: string;
  line_total: number;
  partner_first_name: string;
  partner_last_name: string;
  category_name: string;
};

export type ItemTransactionInput = {
  id?: number;
  amount: number;
  item: number;
  partner: number;
  price: number;
  type: string;
  unpaidAmount: number;
  lineTotal: number;
};

export type CategoryTransactionInput = {
  id?: number;
  amount: number;
  category: number;
  partner: number;
  price: number;
  type: string;
  unpaidAmount: number;
  lineTotal: number;
};

export type ItemTransactionInputEdit = {
  id?: number;
  amount: number;
  pricePerItem: number;
  unpaidAmount: number;
  status: string;
  line_total: number;
  partner_id: number;
};

export type TransactionItem = {
  transaction_id: number;
  item_id: number;
};

export const getAllItemTransactions = async (
  business_id_arg: number,
  search: string,
  filter: string,
  transactiontype: string
) => {
  //   search = search.trim();
  //   let query = supabase
  //     .from("transaction_item")
  //     .select(
  //       ` transactions!inner(
  //             id,
  //             amount,
  //             price_per_amount,
  //             unpaid_amount,
  //             status,
  //             created_at,
  //             line_total,
  //             partners!inner(
  //                 first_name, last_name
  //       )),
  //         items!inner(
  //             item_name
  //         )
  //         `
  //     )
  //     .eq("items.business_id", business_id)
  //     .eq("transactions.is_deleted", false);

  //   if (search !== "") {
  //     query = query.or(
  //       `items.item_name.ilike.%${search}%, transactions.partners.first_name.ilike.%${search}%, transactions.partners.last_name.ilike.%${search}%`
  //     );
  //   }
  //   if (filter.trim() !== "") {
  //     if (filter === "Paid" || filter === "Unpaid") {
  //       if (filter === "Unpaid") {
  //         query = query.gt("transactions.unpaid_amount", 0);
  //       } else {
  //         query = query.eq("transactions.unpaid_amount", 0);
  //       }
  //     } else {
  //       if (filter !== "All") {
  //         query = query.eq("transactions.status", filter);
  //       }
  //     }
  //   }

  //   const { data, error } = await query;

  //   if (data) {
  //     return data;
  //   } else {
  //     throw new Error(error.message);
  //   }

  let { data, error } = await supabase.rpc("getallitemtransactions", {
    business_id_arg,
    filter,
    search,
    transactiontype,
  });
  if (data) {
    return data;
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getSingleItemTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transaction_item")
    .select(
      `
      items!inner(id, item_name),
      transactions!inner(*, partners(first_name, last_name))
    `
    )
    .eq("transactions.id", id)
    .eq("transactions.is_deleted", false)
    .single();

  if (data) {
    const transactions = Array.isArray(data.transactions)
      ? data.transactions[0]
      : data.transactions;
    const items = Array.isArray(data.items) ? data.items[0] : data.items;
    return {
      partner_id: transactions.partner_id,
      partnerFirstname: transactions.partners.first_name,
      partnerFastname: transactions.partners.last_name,
      amount: transactions.amount,
      pricePerItem: transactions.price_per_amount,
      unpaidAmount: transactions.unpaid_amount,
      lineTotal: transactions.line_total,
      status: transactions.status,
      item_id: items.id,
      item_name: items.item_name,
    };
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const deleteTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({ is_deleted: true })
    .eq("id", id)
    .select();

  if (data) {
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const deleteItemTransaction = async (id: number) => {
  return deleteTransaction(id);
};

export const deleteCategoryTransaction = async (id: number) => {
  return deleteTransaction(id);
};

export const editItemTransaction = async (
  transaction: ItemTransactionInputEdit,
  item_id?: number
) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", transaction.id);
  if (data) {
    if (item_id) {
      const res = await supabase
        .from("transaction_item")
        .update({ item_id })
        .eq("transaction_id", transaction.id);

      if (res.data) {
        console.log("update successful: ", transaction.id);
      }
    }
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const createItemTransaction = async (
  transaction: ItemTransactionInput
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount: transaction.amount,
      price_per_amount: transaction.price,
      unpaid_amount: transaction.unpaidAmount,
      status: transaction.type,
      partner_id: transaction.partner,
      line_total: transaction.lineTotal,
      is_deleted: false,
    })
    .select()
    .single();

  if (data) {
    const res = await supabase
      .from("transaction_item")
      .insert({
        transaction_id: data.id,
        item_id: transaction.item,
      })
      .select();

    if (res.data) {
      return "item transaction created successfylly";
    }
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getAllCategoryTransactions = async (
  business_id_arg: number,
  search: string,
  filter: string,
  transactiontype: string
) => {
  //   let query = supabase
  //     .from("transaction_category")
  //     .select(
  //       ` transactions!inner(
  //             id,
  //             amount,
  //             price_per_amount,
  //             unpaid_amount,
  //             status,
  //             created_at,
  //             line_total,
  //             partners(
  //                 first_name, last_name
  //     )),
  //         categories!inner(
  //             category_name
  //         )
  //         `
  //     )
  //     .eq("categories.business_id", business_id)
  //     .eq("transactions.is_deleted", false);

  //   if (search.trim() !== "") {
  //     query = query.or(
  //       `categories.category_name.ilike.%${search}%, transactions.partners.first_name.ilike.%${search}%, transactions.partners.last_name.ilike.%${search}%`
  //     );
  //   }
  //   if (filter.trim() !== "" && filter !== "All") {
  //     if (filter === "Unpaid") {
  //       query = query.gt("transactions.unpaid_amount", 0);
  //     } else {
  //       query = query.eq("transactions.unpaid_amount", 0);
  //     }
  //   }
  //   if (check.trim() !== "" && check !== "All") {
  //     query = query.eq("transactions.status", filter);
  //   }

  //   const { data, error } = await query;

  //   if (data) {
  //     return data;
  //   } else {
  //     throw new Error(error.message);
  //   }

  let { data, error } = await supabase.rpc("getallcategorytransactions", {
    business_id_arg,
    filter,
    search,
    transactiontype,
  });
  if (data) {
    return data;
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getSingleCategoryTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transaction_category")
    .select(
      `
      categories!inner(id, category_name),
      transactions!inner(*, partners(first_name, last_name))
    `
    )
    .eq("transactions.id", id)
    .eq("transactions.is_deleted", false)
    .single();

  if (data) {
    const transactions = Array.isArray(data.transactions)
      ? data.transactions[0]
      : data.transactions;
    const categories = Array.isArray(data.categories)
      ? data.categories[0]
      : data.categories;
    return {
      partner_id: transactions.partner_id,
      partnerFirstname: transactions.partners.first_name,
      partnerFastname: transactions.partners.last_name,
      amount: transactions.amount,
      pricePerItem: transactions.price_per_amount,
      unpaidAmount: transactions.unpaid_amount,
      lineTotal: transactions.line_total,
      status: transactions.status,
      category_id: categories.id,
      category_name: categories.category_name,
    };
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const editCategoryTransaction = async (
  transaction: CategoryTransactionInput,
  item_id?: number
) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", transaction.id);
  if (data) {
    if (item_id) {
      const res = await supabase
        .from("transaction_item")
        .update({ item_id })
        .eq("transaction_id", transaction.id);

      if (res.data) {
        console.log("update successful: ", transaction.id);
      }
    }
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const createCategoryTransaction = async (
  transaction: CategoryTransactionInput
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount: transaction.amount,
      price_per_amount: transaction.price,
      unpaid_amount: transaction.unpaidAmount,
      status: transaction.type,
      partner_id: transaction.partner,
      line_total: transaction.lineTotal,
      is_deleted: false,
    })
    .select()
    .single();

  if (data) {
    const res = await supabase
      .from("transaction_category")
      .insert({
        transaction_id: data.id,
        category_id: transaction.category,
      })
      .select();

    if (res.data) {
      return "item transaction created successfylly";
    }
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getListOfItems = async (business_id: number) => {
  const { data, error } = await supabase
    .from("items")
    .select(
      `id,
       item_name`
    )
    .eq("business_id", business_id);

  if (data) {
    return data;
  }
  throw new Error(error.message ?? "Something went wrong");
};

export const getListOfPartners = async (business_id: number) => {
  const { data, error } = await supabase
    .from("partners")
    .select(
      `id,
       first_name,
       last_name
       `
    )
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

  if (data) {
    return data;
  }
  throw new Error(error.message ?? "Something went wrong");
};

export const getListOfCategories = async (business_id: number) => {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `id,
       category_name`
    )
    .eq("business_id", business_id);

  if (data) {
    return data;
  }
  throw new Error(error.message ?? "Something went wrong");
};

// Orders (transactions without item/category)
export type OrderTransactionDisplay = {
  id: number;
  amount: number;
  price_per_amount: number;
  unpaid_amount: number;
  status: string;
  created_at: string;
  line_total: number;
  description?: string;
  partners?: {
    first_name: string;
    last_name: string;
  } | null;
};

export type OrderTransactionInput = {
  id?: number;
  amount: number;
  partner?: number;
  price: number;
  type: string;
  unpaidAmount: number;
  lineTotal: number;
  description?: string;
};

export const getAllOrders = async (
  business_id: number,
  search: string,
  filter: string
) => {
  const query = supabase
    .from("transactions")
    .select(
      `id,
       amount,
       price_per_amount,
       unpaid_amount,
       status,
       created_at,
       line_total,
       description,
       partners!left(first_name, last_name)`
    )
    .eq("business_id", business_id)
    .eq("is_deleted", false)
    .eq("status", "order");

  if (search.trim() !== "") {
    query.or(
      `description.ilike.%${search}%, partners.first_name.ilike.%${search}%, partners.last_name.ilike.%${search}%`
    );
  }

  if (filter.trim() !== "" && filter !== "All") {
    if (filter === "Paid") {
      query.eq("unpaid_amount", 0);
    } else if (filter === "Unpaid") {
      query.gt("unpaid_amount", 0);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (data) {
    // Transform the data to handle partners array from Supabase
    return data.map((order: any) => ({
      ...order,
      partners:
        Array.isArray(order.partners) && order.partners.length > 0
          ? order.partners[0]
          : null,
    }));
  } else {
    throw new Error(error.message);
  }
};

export const getSingleOrder = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(`*, partners(first_name, last_name)`)
    .eq("id", id)
    .eq("is_deleted", false)
    .eq("status", "order")
    .single();

  if (data) {
    return {
      partner_id: data.partner_id,
      partnerFirstname: data.partners?.first_name || "",
      partnerLastname: data.partners?.last_name || "",
      amount: data.amount,
      pricePerItem: data.price_per_amount,
      unpaidAmount: data.unpaid_amount,
      lineTotal: data.line_total,
      description: data.description || "",
    };
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const createOrder = async (order: OrderTransactionInput) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount: order.amount,
      price_per_amount: order.price,
      unpaid_amount: order.unpaidAmount,
      status: "order",
      partner_id: order.partner || null,
      line_total: order.lineTotal,
      description: order.description || "",
      business_id: 1, // Replace with actual business ID from context/auth
      is_deleted: false,
    })
    .select()
    .single();

  if (data) {
    return "Order created successfully";
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const editOrder = async (order: OrderTransactionInput) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      amount: order.amount,
      price_per_amount: order.price,
      unpaid_amount: order.unpaidAmount,
      partner_id: order.partner || null,
      line_total: order.lineTotal,
      description: order.description || "",
    })
    .eq("id", order.id);

  if (error) {
    throw new Error(error?.message ?? "Something went wrong");
  }
};

export const deleteOrder = async (id: number) => {
  return deleteTransaction(id);
};
