import type { AddNvmeServerPayload } from "@zstack/zsphere-types/graphql";

import type { AddNvmeServerFormValues } from "./schema";

export const buildAddNvmeServerPayload = (
  values: AddNvmeServerFormValues,
): AddNvmeServerPayload => ({
  name: values.name,
  ip: values.ip,
  port: Number(values.port),
  transport: values.transport,
  clusterUuid: values.clusterUuid,
});
