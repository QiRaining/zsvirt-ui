import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const readSource = (path: string) => {
  const sourcePath = [
    resolve(process.cwd(), path),
    resolve(process.cwd(), "zsphere/apps/administration", path),
    resolve(process.cwd(), "packages/products/zsv/apps/administration", path),
  ].find(existsSync);

  return readFileSync(sourcePath!, "utf8");
};

describe("license management query split", () => {
  it("does not call the shared queryLicenseInfo hook on page entry", () => {
    const source = readSource("src/pages/license-management/index.tsx");

    expect(source).not.toContain("useGetLicenseInfo");
  });

  it("does not query or render vmware occupy count", () => {
    const pageSource = readSource("src/pages/license-management/index.tsx");
    const mainLicenseSource = readSource(
      "src/pages/license-management/current-license/main-license/index.tsx",
    );
    const alertsSource = readSource(
      "src/pages/license-management/current-license/alerts/index.tsx",
    );
    const gqlSource = readSource("src/gql/lincense-management.gql");

    expect(gqlSource).not.toContain("getVMwareLicenseOccupyCount");
    expect(pageSource).not.toContain("getVMwareLicenseOccupyCount");
    expect(pageSource).not.toContain("vmwareOccupyInfo");
    expect(mainLicenseSource).not.toContain("vmwareOccupyInfo");
    expect(alertsSource).not.toContain("vmwareOccupyInfo");
  });

  it("keeps addon card loading overlay independent from the card grid", () => {
    const source = readSource(
      "src/pages/license-management/current-license/addons-license/index.tsx",
    );
    const pageSource = readSource("src/pages/license-management/index.tsx");
    const currentLicenseSource = readSource(
      "src/pages/license-management/current-license/index.tsx",
    );
    const cardSource = readSource(
      "src/pages/license-management/current-license/addons-license/card.tsx",
    );
    const styleSource = readSource(
      "src/pages/license-management/current-license/addons-license/style.module.less",
    );

    expect(source).not.toContain("<Spinner spinning={loading}>");
    expect(source).not.toContain('style["card-loading-wrapper"]');
    expect(pageSource).not.toContain(
      "licenseExtensionLoading || addOnsLoading",
    );
    expect(currentLicenseSource).toContain("addOnsLoading");
    expect(currentLicenseSource).toContain("loading={addOnsLoading}");
    expect(source).toContain("loading={loading}");
    expect(cardSource).toContain("loading?: boolean");
    expect(cardSource).toContain('style["card-loading-mask"]');
    expect(styleSource).toContain(".card-loading-mask");
  });

  it("does not write license detail to the platform store", () => {
    const source = readSource("src/pages/license-management/index.tsx");

    expect(source).not.toContain("setLicense");
    expect(source).not.toContain("state.license");
    expect(source).not.toContain("mainLicenseDetail: licenseInfo");
  });

  it("keeps getAboutLicenseInfo focused on primary fields", () => {
    const gql = readSource("src/gql/lincense-management.gql");
    const mainQuery = gql.match(
      /query getAboutLicenseInfo \{[\s\S]*?\n\}/,
    )?.[0];

    expect(mainQuery).toContain("getAboutLicenseInfo");
    expect(mainQuery).not.toContain("dualManagementNodeInfo");
    expect(mainQuery).not.toContain("hostNameList");
    expect(mainQuery).not.toContain("additions");
    expect(gql).toContain("query getAboutLicenseExtensionInfo");
  });
});
