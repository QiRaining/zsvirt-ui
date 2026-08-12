import type React from "react";

export interface TransformContext {
  payload: any;
  setPayload: (p: any) => void;
  setChangeKeys: React.Dispatch<React.SetStateAction<string[]>>;
  resourceUuid: string;
}
