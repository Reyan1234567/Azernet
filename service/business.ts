import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"

export type Businesses=Database['public']['Tables']['businesses']['Row']

export const getBusinessIds=async(userId:string|undefined):Promise<number[]>=>{
    const {data, error}=await supabase.from("businesses").select('id').eq("user_id",userId)
    if(error){
        throw new Error("some error occured")
    }
    return data.map((b)=>b.id)
}