import { InventoryTypes } from "@/constants";
import { supabase } from "@/lib/supabase";
import { businessIdExist } from "./business";

export const createBusinessCash = async (
  businessId: number,
  type: string,
  description: string,
  amount: number
) => {
  console.log("In createBusinessCash");
  if (typeof businessId !== "number" || !amount || !description || !amount) {
    throw new Error("Invalid businessId or amount or description or type");
  }
  await businessIdExist(businessId);
  const { data, error } = await supabase
    .from("business_cash")
    .insert({
      business_id: businessId,
      type,
      amount,
      description,
    })
    .select();

  if (error) {
    throw new Error(
      error.message ?? "Something went wrong when creating a businessCash"
    );
  }
  return data;
};

export const createDeposit = async (
  business_id_args: number,
  amount: number,
  description: string
) => {
  await createBusinessCash(
    business_id_args,
    InventoryTypes.IN,
    description,
    amount
  );
};

export const createWithdraw = async (
  business_id_args: number,
  amount: number,
  description: string
) => {
  const moneyLeft = await getSumMoney(business_id_args);
  if (amount > moneyLeft) {
    throw new Error("You don't have that much money!");
  }
  await createBusinessCash(
    business_id_args,
    InventoryTypes.OUT,
    description,
    amount * -1
  );
};

export const getSumMoney = async (business_id_arg: number) => {
  let { data, error } = await supabase.rpc("getsumofmoney", {
    business_id_arg,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const checkIfEnough = async (business_id_arg: number) => {
  let { data, error } = await supabase.rpc("checkifenoughcash", {
    business_id_arg,
  });
  if (error) {
    throw new Error(
      error?.message ??
        "Something went wrong when checking if available cash is enough"
    );
  }
  return data;
};
