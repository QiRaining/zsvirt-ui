import { createContext, useId } from "react";

import { IBusinessMonitorContext } from "./type";

export const BusinessMonitorContext = createContext<IBusinessMonitorContext>(
  {},
);

export function BusinessMonitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const syncId = useId();

  return (
    <BusinessMonitorContext.Provider value={{ syncId }}>
      {children}
    </BusinessMonitorContext.Provider>
  );
}
