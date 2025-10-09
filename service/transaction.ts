import { supabase } from "@/lib/supabase";

export type ItemTransactionDisplay = {
  transactions: {
    id: number;
    amount: number;
    price_per_amount: number;
    unpaid_amount: number;
    status: string;
    created_at: string;
    line_total: number;
    partners: {
      first_name: string;
      last_name: string;
    };
  };

  items: {
    item_name: string;
  };
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
  business_id: number,
  search: string,
  filter: string
) => {
  const query = supabase
    .from("transaction_item")
    .select(
      ` transactions!inner(
            id,
            amount,
            price_per_amount,
            unpaid_amount,
            status,
            created_at,
            line_total,
            partners(
                first_name, last_name
    )),
        items!inner(
            item_name
        )
        `
    )
    .eq("items.business_id", business_id)
    .eq("transactions.is_deleted", false);

  if (search.trim() !== "") {
    query.or(
      `items.item_name.ilike.%${search}%, transactions.partners.first_name.ilike.%${search}%, transactions.partners.last_name.ilike.%${search}%`
    );
  }
  if (filter.trim() !== "") {
    if (filter === "Paid" || filter === "Unpaid") {
      if (filter === "Unpaid") {
        query.gt("transactions.unpaid_amount", 0);
      } else {
        query.eq("transactions.unpaid_amount", 0);
      }
    } else {
      if (filter !== "All") {
        query.eq("transactions.status", filter);
      }
    }
  }

  const { data, error } = await query;

  if (data) {
    return data;
  } else {
    throw new Error(error.message);
  }
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
    const transactions=Array.isArray(data.transactions)?data.transactions[0]:data.transactions
    const items=Array.isArray(data.items)?data.items[0]:data.items
    return {
      partner_id:transactions.partner_id,
      partnerFirstname:transactions.partners.first_name,
      partnerFastname:transactions.partners.last_name,
      amount:transactions.amount,
      pricePerItem:transactions.price_per_amount,
      unpaidAmount:transactions.unpaid_amount,
      lineTotal:transactions.line_total,
      status:transactions.status,
      item_id: items.id,
      item_name: items.item_name,
    };
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const deleteItemTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({ is_deleted: true })
    .eq("id", id);

  if (data) {
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
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
    .eq("business_id", business_id);

  if (data) {
    return data;
  }
  throw new Error(error.message ?? "Something went wrong");
};
