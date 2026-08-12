import type { Zone } from "@zstack/zsphere-types/graphql";
import { createContext } from "react";

export interface ZoneContextProps {
  selectedZone?: Zone;
  setSelectedZone?: (selectedZone: Zone) => void;
}

export const ZoneContext = createContext<ZoneContextProps>({
  selectedZone: {
    uuid: "",
    name: "",
  },
  setSelectedZone: () => {},
});
