import { supabase } from "@/lib/supabase";

export type ItemTransactionDisplay = {
  id: number;
  amount: number;
  price_per_amount: number;
  unpaid_amount: number;
  created_at: string;
  line_total: number;
  first_name: string;
  last_name: string;
  item_name: string;
};
export type TransactionDisplay = {
  id: number;
  amount: number;
  price_per_amount: number;
  unpaid_amount: number;
  created_at: string;
  line_total: number;
  first_name: string;
  last_name: string;
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
  numberOfItems: number;
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
  filter: string
) => {
  let { data, error } = await supabase.rpc("getallpurcahses", {
    business_id_arg,
    filter,
    search,
  });
  if (error) {
    throw new Error(error.message);
  } else return data;

  // // Query the transactions table directly with joins to items
  // let query = supabase
  //   .from("purchases")
  //   .select(
  //     `
  //     id,
  //     amount,
  //     price_per_amount,
  //     unpaid_amount,
  //     created_at,
  //     line_total,
  //     item_id,
  //     items!inner(
  //       id,
  //       item_name,
  //       business_id
  //     )
  //   `
  //   )
  //   .eq("items.business_id", business_id_arg)
  //   .eq("is_deleted", false);

  // Filter by transaction type if specified
  // if (transactiontype && transactiontype !== "All") {
  //   query = query.eq("status", transactiontype);
  // }

  // // Apply search filter
  // if (search && search.trim() !== "") {
  //   query = query.ilike("items.item_name", `%${search.trim()}%`);
  // }

  // // Apply payment status filter
  // if (filter && filter !== "All") {
  //   if (filter === "Paid") {
  //     query = query.eq("unpaid_amount", 0);
  //   } else if (filter === "Unpaid") {
  //     query = query.gt("unpaid_amount", 0);
  //   }
  // }

  // const { data, error } = await query.order("created_at", { ascending: false });

  // if (data) {
  //   // Transform the data to match ItemTransactionDisplay type
  //   return data.map((transaction: any) => ({
  //     transaction_id: transaction.id,
  //     amount: transaction.amount || 0,
  //     price_per_amount: transaction.price_per_amount || 0,
  //     unpaid_amount: transaction.unpaid_amount || 0,
  //     status: transaction.status || "",
  //     created_at: transaction.purchase_date || new Date().toISOString(),
  //     line_total: transaction.line_total || 0,
  //     partner_first_name: "", // No partner info available
  //     partner_last_name: "", // No partner info available
  //     item_name: transaction.items?.item_name || "",
  //   }));
  // }

  // throw new Error(error?.message ?? "Something went wrong");
};

export const getSingleItemTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      items!inner(id, item_name)
    `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (data) {
    return {
      partner_id: null, // No partner_id in current schema
      partnerFirstname: "",
      partnerLastname: "",
      amount: data.amount || 0,
      pricePerItem: data.price_per_amount || 0,
      unpaidAmount: data.unpaid_amount || 0,
      lineTotal: data.line_total || 0,
      status: data.status || "",
      item_id: data.items?.id || 0,
      item_name: data.items?.item_name || "",
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
  const updateData: any = {
    amount: transaction.amount,
    price_per_amount: transaction.pricePerItem,
    unpaid_amount: transaction.unpaidAmount,
    status: transaction.status,
    line_total: transaction.line_total,
  };

  // Update item_id_id if provided
  if (item_id) {
    updateData.item_id_id = item_id;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", transaction.id);

  if (error) {
    throw new Error(error?.message ?? "Something went wrong");
  }

  return data;
};

export const createItemTransaction = async (
  transaction: ItemTransactionInput
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount: transaction.numberOfItems,
      price_per_amount: transaction.price,
      unpaid_amount: transaction.unpaidAmount,
      status: transaction.type,
      item_id_id: transaction.item, // Use item_id_id field from schema
      line_total: transaction.lineTotal,
      is_deleted: false,
      purchase_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (data) {
    return "item transaction created successfully";
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getAllCategoryTransactions = async (
  business_id_arg: number,
  search: string,
  filter: string,
  transactiontype: string
) => {
  // Query the transactions table directly with joins to categories
  let query = supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      price_per_amount,
      unpaid_amount,
      status,
      purchase_date,
      line_total,
      category_id,
      categories!inner(
        id,
        category_name,
        business_id
      )
    `
    )
    .eq("categories.business_id", business_id_arg)
    .eq("is_deleted", false)
    .not("category_id", "is", null); // Only get transactions with categories

  // Filter by transaction type if specified
  if (transactiontype && transactiontype !== "All") {
    query = query.eq("status", transactiontype);
  }

  // Apply search filter
  if (search && search.trim() !== "") {
    query = query.ilike("categories.category_name", `%${search.trim()}%`);
  }

  // Apply payment status filter
  if (filter && filter !== "All") {
    if (filter === "Paid") {
      query = query.eq("unpaid_amount", 0);
    } else if (filter === "Unpaid") {
      query = query.gt("unpaid_amount", 0);
    }
  }

  const { data, error } = await query.order("purchase_date", {
    ascending: false,
  });

  if (data) {
    // Transform the data to match CategoryTransactionDisplay type
    return data.map((transaction: any) => ({
      transaction_id: transaction.id,
      amount: transaction.amount || 0,
      price_per_amount: transaction.price_per_amount || 0,
      unpaid_amount: transaction.unpaid_amount || 0,
      status: transaction.status || "",
      created_at: transaction.purchase_date || new Date().toISOString(),
      line_total: transaction.line_total || 0,
      partner_first_name: "", // No partner info available
      partner_last_name: "", // No partner info available
      category_name: transaction.categories?.category_name || "",
    }));
  }

  throw new Error(error?.message ?? "Something went wrong");
};

export const getSingleCategoryTransaction = async (id: number) => {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories!inner(id, category_name)
    `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (data) {
    return {
      partner_id: null, // No partner_id in current schema
      partnerFirstname: "",
      partnerLastname: "",
      amount: data.amount || 0,
      pricePerItem: data.price_per_amount || 0,
      unpaidAmount: data.unpaid_amount || 0,
      lineTotal: data.line_total || 0,
      status: data.status || "",
      category_id: data.categories?.id || 0,
      category_name: data.categories?.category_name || "",
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
      category_id: transaction.category, // Use category_id field from schema
      line_total: transaction.lineTotal,
      is_deleted: false,
      purchase_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (data) {
    return "category transaction created successfully";
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
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });

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

// // Orders (transactions without item/category)
export type OrderTransactionDisplay = {
  id: number;
  item_name:string;
  consumer_first_name: string;
  consumer_last_name: string;
  description?: string | null;
  status: string;
  created_at: string;
  number_of_items: number;
  purchase_id: number | null;
  sale_id: number | null;
};

// export type OrderTransactionInput = {
//   number_of_items: number;
//   partner?: number;
//   item: number;
//   description?: string;
// };

// export const getAllOrders = async (
//   business_id_args: number,
//   search: string,
//   filter: string
// ) => {
//   let { data, error } = await supabase.rpc("getallorders", {
//     business_id_args,
//     filter,
//     search,
//   });
//   if (error) {
//     throw new Error(
//       error.message ?? "Something went wrong when getting All orders"
//     );
//   } else return data;
// };

// export const getSingleOrder = async (id: number) => {
//   const { data, error } = await supabase
//     .from("transactions")
//     .select(`*`)
//     .eq("id", id)
//     .eq("is_deleted", false)
//     .eq("status", "order")
//     .single();

//   if (data) {
//     return {
//       partner_id: null, // No partner_id in current schema
//       partnerFirstname: "",
//       partnerLastname: "",
//       amount: data.amount,
//       pricePerItem: data.price_per_amount,
//       unpaidAmount: data.unpaid_amount,
//       lineTotal: data.line_total,
//       description: data.measure || "", // Using measure as description
//     };
//   }
//   throw new Error(error?.message ?? "Something went wrong");
// };

// export const createOrder = async (order: OrderTransactionInput) => {
//   const { data, error } = await supabase
//     .from("orders")
//     .insert({
//       item_id: order.item,
//       consumer_id: order.partner,
//       description: order.description,
//       number_of_items: order.number_of_items,
//       is_deleted: false,
//     })
//     .select()
//     .single();

//   if (data) {
//     return "Order created successfully";
//   }

//   throw new Error(error?.message ?? "Something went wrong");
// };

// export const editOrder = async (order: OrderTransactionInput) => {
//   const { data, error } = await supabase
//     .from("transactions")
//     .update({
//       amount: order.amount,
//       price_per_amount: order.price,
//       unpaid_amount: order.unpaidAmount,
//       line_total: order.lineTotal,
//       measure: order.description || "", // Using measure field for description
//     })
//     .eq("id", order.id);

//   if (error) {
//     throw new Error(error?.message ?? "Something went wrong");
//   }
// };

// export const deleteOrder = async (id: number) => {
//   return deleteTransaction(id);
// };

// Purchase-specific functions
export const getAllPurchaseTransactions = async (
  business_id_arg: number,
  search: string,
  filter: string
) => {
  // Use the corrected getAllItemTransactions function with Purchase filter
  return getAllItemTransactions(business_id_arg, search, filter);
};

export const getAllSalesTransactions = async (
  business_id_arg: number,
  search: string,
  filter: string
) => {
  // Use the corrected getAllItemTransactions function with Sale filter

  let { data, error } = await supabase.rpc("getallsales", {
    business_id_arg,
    filter,
    search,
  });
  if (error) {
    throw new Error(
      error.message ?? "Something went wrong when retreiving all sales"
    );
  } else return data;
};
