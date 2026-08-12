import { createContext } from "react";

export interface ZoneUuidContextProps {
  zoneUuid?: string;
}
export const ZoneUuidContext = createContext<ZoneUuidContextProps>({});
