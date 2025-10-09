import { createContext, useState } from "react";
import * as AsyncStore from "expo-secure-store"
import { useAuth } from "./authContext";
import { getBusinessIds } from "@/service/business";
type businessContextType = {
  businessId: string;
};

export const BusinessContext = createContext<businessContextType | undefined>(
  undefined
);
export const BusinessProvider = (children:any) => {
  const [businessId, setBusinessId] = useState("");
  const {session}=useAuth()
  const id=AsyncStore.getItem("businessId")
  if(!id){
    getBusinessIds(session?.user?.id).then((ids)=>{
        setBusinessId(String(ids[0]))
    })
  }
  else{
    setBusinessId(id)
  }
  return (
    <BusinessContext.Provider value={{ businessId }}>
      {children}
    </BusinessContext.Provider>
  );
};
