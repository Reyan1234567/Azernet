import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "./authContext";
import { getBusinessIds, getBusinessIdsT } from "@/service/business";

type businessContextType = {
  businessId: number | null;
  businesses: getBusinessIdsT[] | null;
  setBusiness: (businessId: number) => void;
  isLoading: boolean;
};

export const BusinessContext = createContext<businessContextType | undefined>(
  undefined
);

export const BusinessProvider = ({ children }: any) => {
  console.log("BUSINESS PROVIDER RE-RENDERED");
  const [businessId, setBusinessId] = useState<number | null>(0);
  const [businesses, setBusinesses] = useState<getBusinessIdsT[] | null>([]);
  const [isLoading, setLoading] = useState(true);
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
      const AllBusinesses = await getBusinesses();
      const businessIdValue = SecureStore.getItem("businessId");
      if (businessIdValue) {
        console.log("businessIdValue: ", businessIdValue);
        businessId === 0 && setBusinessId(Number(businessIdValue));
      } else if (AllBusinesses !== undefined && AllBusinesses.length !== 0) {
        console.log("businesses: ", AllBusinesses);
        console.log(AllBusinesses[0].id);
        setBusiness(AllBusinesses[0].id);
      } else {
        console.log("Nothing apparently");
      }
      if (ID) {
        setLoading(false);
      }
    };
    func();
  }, [ID]);

  const getBusinesses = async (): Promise<getBusinessIdsT[] | undefined> => {
    console.log("getting Businesses");
    try {
      const businessArr = await getBusinessIds(ID);
      console.log(businessArr);
      setBusinesses(businessArr);
      return businessArr;
    } catch (e) {
      console.log("Couldn't get all businesses", e.message);
    }
  };

  const values = useMemo(
    () => ({
      setBusiness,
      businessId,
      businesses,
      isLoading,
    }),
    [businessId, businesses, isLoading]
  );

  return (
    <BusinessContext.Provider value={values}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const Business = useContext(BusinessContext);
  if (!Business) {
    throw new Error("Business context not implemented!");
  }
  return Business;
};
