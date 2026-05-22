import { createContext, useContext } from "react";

const UKSContext = createContext(null);

export function UKSProvider({ children }) {
  // UKSProvider has been fully decommissioned.
  // Real data flows via React components fetching from Laravel API directly.
  return (
    <UKSContext.Provider value={{}}>
      {children}
    </UKSContext.Provider>
  );
}

export function useUKS() {
  return useContext(UKSContext);
}

