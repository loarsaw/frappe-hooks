import React, { createContext, useContext, useEffect, useState } from "react";
import { FrappeClient } from "../..";
import { IFrappeInstance } from "../../types";
const FrappeContext = createContext<FrappeClient | null>(null);

export const FrappeProvider: React.FC<{
  children: React.ReactNode;
  options: IFrappeInstance;
}> = ({ children, options }) => {
  const [client, setClient] = useState<FrappeClient | null>(
    new FrappeClient({
      baseURL: options.baseURL,
    })
  );

  useEffect(() => {
    const client = FrappeClient.getInstance(options);
    setClient(client);
  }, [options]);

  if (!client) return null;

  return (
    <FrappeContext.Provider value={client}>{children}</FrappeContext.Provider>
  );
};

export function useFrappe() {
  const context = useContext(FrappeContext);
  if (!context) {
    throw new Error("useFrappe must be used within a FrappeProvider");
  }
  return context;
}
