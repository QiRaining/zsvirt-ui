import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface MenuItem {
  key: string;
  path?: string;
  prevKey?: string;
  nextKey?: string;
  children?: MenuItem[];
}

const appRoot = resolve(__dirname, "../../..");
const repoRoot = resolve(appRoot, "../../..");
const readSource = (relativePath: string) =>
  readFileSync(resolve(appRoot, relativePath), "utf8");

describe("core-shell telemetry integration contract", () => {
  it("places telemetry between log and email server in both menu sources", () => {
    const menuPath = resolve(
      repoRoot,
      "zsphere/shared/config/src/menu/menu.json",
    );
    const listPath = resolve(
      repoRoot,
      "zsphere/shared/config/src/menu/list.json",
    );
    const menu = JSON.parse(readFileSync(menuPath, "utf8")) as MenuItem[];
    const list = JSON.parse(readFileSync(listPath, "utf8")) as MenuItem[];
    const platformSettings = menu
      .flatMap((item) => item.children ?? [])
      .find((item) => item.key === "virtualization.system.setting");
    const children = platformSettings?.children ?? [];
    const telemetryIndex = children.findIndex(
      (item) => item.key === "virtualization.telemetry",
    );

    expect(telemetryIndex).toBeGreaterThan(0);
    expect(children[telemetryIndex - 1]?.key).toBe("virtualization.log.server");
    expect(children[telemetryIndex + 1]?.key).toBe(
      "virtualization.email.server",
    );

    const telemetry = list.find(
      (item) => item.key === "virtualization.telemetry",
    );
    expect(telemetry).toMatchObject({
      path: "/virtualization-administration/telemetry",
      prevKey: "virtualization.log.server",
      nextKey: "virtualization.email.server",
    });
  });

  it("filters the menu and route with the shared built-in Admin helper", () => {
    const menuTreeSource = readSource("src/layouts/left-nav/use-menu-tree.ts");
    const routeSource = readSource(
      "src/routes/sub-app-routers/administration.tsx",
    );

    expect(menuTreeSource).toContain("useUserIdentity");
    expect(menuTreeSource).toContain("virtualization.telemetry");
    expect(routeSource).toContain("zsv_administration/src/pages/telemetry");
    expect(routeSource).toContain("SystemAdminOnly");
    expect(routeSource).toContain('path="telemetry"');
  });

  it("mounts the remote consent gate behind an isolated error boundary", () => {
    const layoutSource = readSource("src/layouts/index.tsx");

    expect(layoutSource).toContain(
      "zsv_administration/src/features/telemetry/consent-gate",
    );
    expect(layoutSource).toContain("TelemetryConsentGateBoundary");
    expect(layoutSource).toContain("blocked={visible}");
  });

  it("registers the telemetry menu translation key", () => {
    const translationSource = readSource("src/utils/translate-menu.ts");

    expect(translationSource).toContain('"virtualization.telemetry"');
    expect(translationSource).toContain(
      'defaultMessage: "Experience Improvement Program"',
    );
  });

  it("normalizes telemetry consent updates with the stable inventory uuid", () => {
    const apolloSource = readSource("src/utils/apollo.ts");

    expect(apolloSource).toContain("TelemetryConsentInventory: {");
    expect(apolloSource).toMatch(
      /TelemetryConsentInventory:\s*\{\s*keyFields:\s*\["uuid"\]/,
    );
  });

  it("mounts update check in the global header before the user menu", () => {
    const headerSource = readSource("src/layouts/header/index.tsx");
    const updateCheckSource = readSource("src/layouts/header/update-check.tsx");

    expect(headerSource).toContain("import UpdateCheck");
    expect(headerSource).toMatch(/<UpdateCheck \/>[\s\S]*<User \/>/);
    expect(updateCheckSource).toContain("useUserIdentity");
    expect(updateCheckSource).toContain("isSystemAdmin");
    expect(updateCheckSource).toContain(
      "query CheckTelemetryUpdateForUpdateCheck",
    );
    expect(updateCheckSource).toContain("checkTelemetryUpdate");
    expect(updateCheckSource).toContain("currentVersion");
    expect(updateCheckSource).toContain("releaseNotesZh");
    expect(updateCheckSource).toContain("releaseNotesEn");
    expect(updateCheckSource).toContain("telemetry.version.action.check");
    expect(updateCheckSource).toContain("telemetry.version.dialog.title");
    expect(updateCheckSource).not.toContain("LATEST_VERSION");
    expect(updateCheckSource).not.toContain("query GetVersionForUpdateCheck");
    expect(updateCheckSource).not.toContain("getVersion {");
  });
});
