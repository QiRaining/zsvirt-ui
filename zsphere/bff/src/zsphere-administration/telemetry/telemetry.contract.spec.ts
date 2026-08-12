import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("telemetry BFF contract", () => {
  const apiRoot = resolve(__dirname, "../../api/zstack");

  it.each([
    {
      fileName: "GetTelemetryConsentAction.ts",
      baseClass: "QueryAdvance",
      method: "zsHttpService.get",
      path: "/telemetry/consent",
    },
    {
      fileName: "GetTelemetrySettingsAction.ts",
      baseClass: "QueryAdvance",
      method: "zsHttpService.get",
      path: "/telemetry/settings",
    },
    {
      fileName: "UpdateTelemetryConsentAction.ts",
      baseClass: "ActionAdvance",
      method: "zsHttpService.put",
      path: "/telemetry/consent",
    },
    {
      fileName: "CheckTelemetryUpdateAction.ts",
      baseClass: "ActionAdvance",
      method: "zsHttpService.put",
      path: "/telemetry/updates/check",
    },
  ])(
    "provides $fileName in the generated ZStack API format",
    ({ fileName, baseClass, method, path }) => {
      const filePath = resolve(apiRoot, fileName);

      expect(existsSync(filePath)).toBe(true);

      if (!existsSync(filePath)) {
        return;
      }

      const source = readFileSync(filePath, "utf8");

      expect(source).toContain(`extends ${baseClass}`);
      expect(source).toContain(method);
      expect(source).toContain(path);
      expect(source).toContain("preAction(");
      expect(source).toContain("postAction<");
    },
  );

  it("registers and exports every telemetry API class", () => {
    const moduleSource = readFileSync(
      resolve(apiRoot, "zstack-api.module.ts"),
      "utf8",
    );

    for (const className of [
      "GetTelemetryConsentAction",
      "GetTelemetrySettingsAction",
      "UpdateTelemetryConsentAction",
      "CheckTelemetryUpdateAction",
    ]) {
      expect(moduleSource).toContain(
        `import { ${className} } from "./${className}"`,
      );
      expect(moduleSource.match(new RegExp(`\\b${className}\\b`, "g"))).toHaveLength(
        4,
      );
    }
  });

  it("uses the standard ActionInput wrapper and rejects non-Admin sessions", () => {
    const actionPath = resolve(__dirname, "telemetry.action.ts");
    const modelPath = resolve(__dirname, "telemetry.model.ts");
    const servicePath = resolve(__dirname, "telemetry.service.ts");

    expect(existsSync(actionPath)).toBe(true);
    expect(existsSync(modelPath)).toBe(true);
    expect(existsSync(servicePath)).toBe(true);

    if (
      !existsSync(actionPath) ||
      !existsSync(modelPath) ||
      !existsSync(servicePath)
    ) {
      return;
    }

    const actionSource = readFileSync(actionPath, "utf8");
    const modelSource = readFileSync(modelPath, "utf8");
    const serviceSource = readFileSync(servicePath, "utf8");

    expect(modelSource).toContain("payload: UpdateTelemetryConsentPayload");
    expect(modelSource).toContain("action: ActionInput");
    expect(modelSource).toContain("TelemetryUpdateInventory");
    expect(actionSource).toContain("actionHelper(");
    expect(actionSource).not.toContain("catch (");
    expect(serviceSource).toContain("assertSystemAdmin");
    expect(serviceSource).toContain("checkTelemetryUpdateAction.call({})");
  });
});
