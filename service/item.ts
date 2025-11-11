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
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (filter && filter !== "All" && filter.trim() !== "") {
    query = query.eq("measure", filter);
  }

  if (search && search.trim() !== "") {
    query = query.or(`item_name.ilike.%${search}%, measure.ilike.%${search}%`);
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
    .eq("id", id)
    .select()
    .single();

  if (data) return data;

  throw new Error(error?.message ?? "Something went wrong");
};

export type createItemType = {
  id?: number;
  description: string;
  item_name: string;
  measure: string;
  business_id: number;
};

export const checkItemExistence = async (itemId: number) => {
  const item = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();
  if (item.error) {
    if (item.error.code === "02000") {
      throw new Error(`Can't find item with id: ${itemId}`);
    }
    throw new Error(item.error.message ?? "Something went wrong");
  }
  return item.data;
};

export const getInvetoryInfo = async (businessId: number, date: Date) => {
  let { data, error } = await supabase.rpc("get_invetory_info", {
    business_id_arg: businessId,
    date_arg: date,
  });
  if (error) throw new Error();
  else return data;
};
