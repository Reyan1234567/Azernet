import { supabase } from "@/lib/supabase";

export const getAllItems = async (
  businessId: number,
  search: string,
  filter: string
) => {
  let query = supabase
    .from("items")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_deleted", false);

  if (filter && filter !== "All" && filter.trim() !== "") {
    query=query.eq("status", filter);
  }

  if (search && search.trim() !== "") {
    query=query.or(`item_name.ilike.%${search}%, measure.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (data) return data;

  throw new Error(error?.message ?? "Something went wrong");
};

export const getAsingleItem = async (id: number) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (data) return data;

  throw new Error(error?.message ?? "Something went wrong");
};

export const createItem = async (item: createItemType) => {
  const { error } = await supabase.from("items").insert(item);
  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const editItem = async (item: createItemType) => {
  const { error } = await supabase.from("items").update(item).eq("id", item.id);

  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const deleteItem = async (id: number) => {
  const { data, error } = await supabase
    .from("items")
    .update({ is_deleted: true })
    .eq("id", id);

  if (data) return "Item deleted succesfully";

  throw new Error(error?.message ?? "Something went wrong");
};

export type createItemType = {
  id?: number;
  description: string;
  item_name: string;
  purchase_price: number;
  projected_selling_price: number;
  measure: string;
};
