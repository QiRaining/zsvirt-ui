import { expect, it } from "vitest";

import { buildInstallMigrationServicePayload } from "./action-payload";

it("wraps the single installation in the GraphQL list payload", () => {
  expect(buildInstallMigrationServicePayload("package-1", "{\"cpu\":8}")).toEqual([
    { uuid: "package-1", config: "{\"cpu\":8}" },
  ]);
});
