import { supabase } from "@/lib/supabase";

export const getAllCategories = async (
  businessId: number,
  search: string = ""
) => {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("business_id", businessId)
    .is("is_deleted", false);

  if (search && search.trim() !== "") {
    query = query.ilike("category_name", `%${search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (data) return data;

  throw new Error(error?.message ?? "Something went wrong");
};

export const getAsingleCategory = async (id: number) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (data) return data;

  throw new Error(error?.message ?? "Something went wrong");
};

export const createCategory = async (category: CreateCategoryType) => {
  const { error } = await supabase.from("categories").insert(category);
  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const editCategory = async (category: CreateCategoryType) => {
  const { error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", category.id);

  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const deleteCategory = async (id: number) => {
  const { error } = await supabase
    .from("categories")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    throw new Error(error?.message ?? "Something went wrong");
  }

  return "Category deleted successfully";
};

export type CreateCategoryType = {
  id?: number;
  category_name: string;
  business_id: number;
};
