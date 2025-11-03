import { createContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./authContext";
import { getBusinessIds, getBusinessIdsT } from "@/service/business";

type businessContextType = {
  businessId: number | null;
  businesses: getBusinessIdsT[] | null;
  setBusiness: (businessId: number) => void;
};

export const BusinessContext = createContext<businessContextType | undefined>(
  undefined
);

export const BusinessProvider = ({ children }: any) => {
  console.log("BUSINESS PROVIDER RE-RENDERED");
  const [businessId, setBusinessId] = useState<number | null>(0);
  const [businesses, setBusinesses] = useState<getBusinessIdsT[] | null>([]);

  const setBusiness = (businessId: number) => {
    console.log("In the place that should have set the bId");
    console.log(businessId);
    setBusinessId(businessId);
    SecureStore.setItem("businessId", businessId.toString());
  };

  const { session } = useAuth();

  const ID = session?.user.id;

  useEffect(() => {
    console.log("In the useEffect of the BuseinessContext");
    const func = async () => {
      await getBusinesses();
      const businessIdValue = SecureStore.getItem("businessId");
      if (businessIdValue) {
        console.log("businessIdValue: ", businessIdValue[0]);
        setBusinessId(Number(businessIdValue[0]));
      } else if (businesses) {
        console.log("businesses: ", businesses);
        setBusiness(businesses[0].id);
      } else {
        console.log("Shii nothing apparently");
      }
    };
    func();
  }, [ID]);

  const getBusinesses = async () => {
    console.log("getting Businesses");
    await getBusinessIds(ID)
      .then((businessArr) => {
        console.log(businessArr);
        setBusinesses(businessArr);
      })
      .catch((e) => {
        console.log("Couldn't get all businesses", e.message);
        console.log("can't");
      });
  };

  const values = useMemo(
    () => ({
      setBusiness,
      businessId,
      businesses,
    }),
    []
  );

  return (
    <BusinessContext.Provider value={values}>
      {children}
    </BusinessContext.Provider>
  );
};
