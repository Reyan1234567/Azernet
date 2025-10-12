import { supabase } from "@/lib/supabase";

type Partner = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  business_id: number;
  role: string;
  created_at: string;
  is_deleted: boolean;
};

export const getPartners = async (
  businessId: number,
  search: string,
  filter: string
) => {
  let query = supabase
    .from("partners")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (search && search.trim() !== "") {
    query = query.or(
      `first_name.ilike.%${search}%, last_name.ilike.%${search}%, phone_number.ilike.%${search}%`
    );
  }

  if (filter && filter !== "All" && filter.trim() !== "") {
    query = query.eq("role", filter);
  }

  const { data, error } = await query;

  if (data) {
    return data;
  }
  throw new Error(error?.message ?? "Something went wrong");
};

export const deletePartner = async (id: number) => {
  const { error } = await supabase
    .from("partners")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  } else {
    return "Partner deleted";
  }
};

export const createPartner = async (partner: {
  first_name: string;
  last_name: string;
  phone_number: string;
  business_id: number;
  role: string;
}) => {
  const { error } = await supabase.from("partners").insert(partner);

  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const editPartner = async (partner: {
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  id: number;
  business_id: number;
}) => {
  const { error } = await supabase
    .from("partners")
    .update(partner)
    .eq("id", partner.id);

  if (error) {
    throw new Error(error.message ?? "Something went wrong");
  }
};

export const getSinglePartner = async (id: number): Promise<Partner> => {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (data) {
    return data;
  }
  throw new Error(error?.message ?? "Partner not found");
};
