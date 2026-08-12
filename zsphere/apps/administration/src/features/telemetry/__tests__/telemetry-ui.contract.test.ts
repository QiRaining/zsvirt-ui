import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const appRoot = resolve(__dirname, "../../../..");
const readSource = (relativePath: string) =>
  readFileSync(resolve(appRoot, relativePath), "utf8");

describe("telemetry UI integration contract", () => {
  it("defines all typed GraphQL operations", () => {
    const gqlPath = resolve(appRoot, "src/gql/telemetry.gql");

    expect(existsSync(gqlPath)).toBe(true);

    if (!existsSync(gqlPath)) {
      return;
    }

    const source = readFileSync(gqlPath, "utf8");
    expect(source).toContain("query GetTelemetryConsent");
    expect(source).toMatch(
      /query GetTelemetryConsent\s*\{[\s\S]*getTelemetryConsent\s*\{[\s\S]*uuid/,
    );
    expect(source).toContain("query GetTelemetrySettings");
    expect(source).toContain("mutation UpdateTelemetryConsent");
  });

  it("shares one consent hook between the page and gate", () => {
    const hookPath = resolve(
      appRoot,
      "src/features/telemetry/use-telemetry-consent.ts",
    );

    expect(existsSync(hookPath)).toBe(true);

    if (!existsSync(hookPath)) {
      return;
    }

    const source = readFileSync(hookPath, "utf8");
    expect(source).toContain("useAuth");
    expect(source).toContain("useAction");
    expect(source).toContain("parseTelemetryConsent");
    expect(source).toContain("parseTelemetrySettings");
    expect(source).toContain("skip: !enabled");
    expect(source).toContain("refetchConsent");
  });

  it("builds the consent dialog on DialogBase with a guarded custom footer", () => {
    const dialogPath = resolve(
      appRoot,
      "src/features/telemetry/components/telemetry-consent-dialog.tsx",
    );

    expect(existsSync(dialogPath)).toBe(true);

    if (!existsSync(dialogPath)) {
      return;
    }

    const source = readFileSync(dialogPath, "utf8");
    expect(source).toContain("DialogBase");
    expect(source).toContain("footer={");
    expect(source).not.toContain("onOk=");
    expect(source).toContain("MarkdownWithHtml");
    expect(source).toContain("normalizeStatementMarkdown");
    expect(source).toContain("DATA_COLLECTION_STATEMENT_CONTENT_ID");
    expect(source).not.toContain("privacyPolicyUrl");
  });

  it("keeps the page and auto prompt behind the built-in Admin gate", () => {
    const pagePath = resolve(appRoot, "src/pages/telemetry/index.tsx");
    const gatePath = resolve(
      appRoot,
      "src/features/telemetry/consent-gate.tsx",
    );

    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync(gatePath)).toBe(true);

    if (!existsSync(pagePath) || !existsSync(gatePath)) {
      return;
    }

    const pageSource = readFileSync(pagePath, "utf8");
    const gateSource = readFileSync(gatePath, "utf8");

    expect(pageSource).toContain("useUserIdentity");
    expect(pageSource).toContain(
      "enabled: isSystemAdmin && Boolean(accountUuid)",
    );
    expect(gateSource).toContain("useUserIdentity");
    expect(gateSource).toContain("shouldOpenTelemetryGate");
    expect(gateSource).toContain("readTelemetryPromptRecord");
  });

  it("gives the consent prompt priority over dashboard onboarding dialogs", () => {
    const gateSource = readSource("src/features/telemetry/consent-gate.tsx");
    const dashboardHeaderSource = readFileSync(
      resolve(appRoot, "../dashboard/src/components/header.tsx"),
      "utf8",
    );

    expect(gateSource).toContain("telemetry:consent-gate:blocking");
    expect(gateSource).toContain("zsv.telemetry.consent-gate.blocking");
    expect(gateSource).toContain("telemetry.loading ||");
    expect(gateSource).toContain("shouldOpen ||");
    expect(dashboardHeaderSource).toContain("telemetry:consent-gate:blocking");
    expect(dashboardHeaderSource).toContain(
      "zsv.telemetry.consent-gate.blocking",
    );
    expect(dashboardHeaderSource).toContain("!telemetryConsentBlocking");
  });

  it("exposes both the page and consent gate from Module Federation", () => {
    const configSource = readSource("rsbuild.config.ts");

    expect(configSource).toContain('"./src/pages/telemetry"');
    expect(configSource).toContain('"./src/features/telemetry/consent-gate"');
  });
});
