import { createContext, useEffect, useMemo, useState } from "react";
// import * as SecureStore from "expo-secure-store";
import { useAuth } from "./authContext";
import { getBusinessIds, getBusinessIdsT } from "@/service/business";

type businessContextType = {
  businessId: string | null;
  businesses: getBusinessIdsT[] | null;
  setBusiness: (businessId: string) => void;
};

export const BusinessContext = createContext<businessContextType | undefined>(
  undefined
);

export const BusinessProvider = ({ children }: any) => {
  const [businessId, setBusinessId] = useState<string | null>("");
  const [businesses, setBusinesses] = useState<getBusinessIdsT[] | null>([]);

  const setBusiness = (businessId: string) => {
    setBusinessId(businessId);
  };

  const { session } = useAuth();

  const id = session?.user.id;
  const getBusinesses = () => {
    getBusinessIds(session?.user.id)
      .then((businessArr) => {
        setBusinesses(businessArr);
      })
      .catch((e) => {
        throw new Error("can't get businesses");
      });
  };

  useEffect(() => {
    console.log(session);
    getBusinesses();
  }, []);

  const values = useMemo(
    () => ({
      businessId,
      businesses,
      setBusiness,
    }),
    [businessId, businesses]
  );
  return (
    <BusinessContext.Provider value={values}>
      {children}
    </BusinessContext.Provider>
  );
};
