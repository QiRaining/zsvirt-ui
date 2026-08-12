import {
  resourceTreeArrangeKeys,
  resourceTreeOrderDirections,
  resourceTreeSettingsDefaultValues,
  toResourceTreeQueryVariables,
  type ResourceTreeSettingsFormValues,
} from "@zstack/zsphere-platform-store";
import { z } from "zod";

export const createResourceTreeSettingsSchema = () =>
  z.object({
    arrangeKey: z.enum(resourceTreeArrangeKeys),
    orderDirection: z.enum(resourceTreeOrderDirections),
  });

export {
  resourceTreeArrangeKeys,
  resourceTreeOrderDirections,
  resourceTreeSettingsDefaultValues,
  toResourceTreeQueryVariables,
  type ResourceTreeSettingsFormValues,
};
