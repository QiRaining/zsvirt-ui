import React, { createContext } from "react";

export interface CreateInstanceProps {
  realSource: any;
  zoneUuid: string;
  setRealSource?: React.Dispatch<React.SetStateAction<any>>;
}

export const CreateInstanceContext = createContext<CreateInstanceProps>({
  realSource: {},
  zoneUuid: "",
});
