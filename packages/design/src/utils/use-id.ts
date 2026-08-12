import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useId = () => {
  const [id] = useState(uuidv4().replace(/-/g, ""));
  return id;
};
