import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem:async(key:string)=>await SecureStore.getItemAsync(key),
      setItem: async(key:string, value:string)=> await SecureStore.setItemAsync(key, value),
      removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
    },
  },
});
