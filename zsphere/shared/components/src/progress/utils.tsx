import { getSemanticColor } from "@zstack/zsphere-utils";

export const getPercentStatus = (number: number) => {
  if (number >= 0 && number < 60) {
    return "low";
  }
  if (number >= 60 && number < 80) {
    return "middle";
  }
  if (number >= 80) {
    return "high";
  }
  return "low";
};
export const getPercentColor = (number: number) => {
  if (number >= 0 && number < 60) {
    return getSemanticColor("info", "light", 500);
  }
  if (number >= 60 && number < 80) {
    return getSemanticColor("alert", "light", 500);
  }
  if (number >= 80) {
    return getSemanticColor("danger", "light", 500);
  }
  return getSemanticColor("info", "light", 500);
};
