import { describe, expect, it } from "vitest";

import {
  getI18nCopyConfig,
  getMfConfig,
  getServerPort,
  getSourceConfig,
} from "./config-generator";
import { MF_CONFIG } from "./mf-config";

describe("ZSV module federation shared dependencies", () => {
  const englishOnlyEnvKeys = [
    "ENGLISH_ONLY",
    "I18N_ENGLISH",
    "ZSV_ENGLISH_ONLY",
  ] as const;

  const withEnglishOnlyEnv = (
    values: Partial<Record<(typeof englishOnlyEnvKeys)[number], string>>,
    testFn: () => void,
  ) => {
    const previous = Object.fromEntries(
      englishOnlyEnvKeys.map((key) => [key, process.env[key]]),
    );

    for (const key of englishOnlyEnvKeys) {
      if (values[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = values[key];
      }
    }

    try {
      testFn();
    } finally {
      for (const key of englishOnlyEnvKeys) {
        if (previous[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = previous[key];
        }
      }
    }
  };

  it("shares zsphere hooks as a singleton so upload session stores are not duplicated", () => {
    expect(MF_CONFIG.globalShared["@zstack/zsphere-hooks"]).toEqual({
      eager: false,
      singleton: true,
      requiredVersion: false,
      strictVersion: false,
    });
  });

  it("includes zsphere hooks in generated app shared config", () => {
    const config = getMfConfig("zsv-core-shell", "production");

    expect(config.shared["@zstack/zsphere-hooks"]).toBe(
      MF_CONFIG.globalShared["@zstack/zsphere-hooks"],
    );
  });

  it("applies ZSV_PORT_OFFSET to dev server ports", () => {
    const previous = process.env.ZSV_PORT_OFFSET;
    process.env.ZSV_PORT_OFFSET = "1000";

    try {
      expect(getServerPort("zsv-core-shell")).toBe(4000);
      expect(getServerPort("zsv-resource")).toBe(8002);
    } finally {
      if (previous === undefined) {
        delete process.env.ZSV_PORT_OFFSET;
      } else {
        process.env.ZSV_PORT_OFFSET = previous;
      }
    }
  });

  it("injects the English Only compile-time flag when I18N_ENGLISH is enabled", () => {
    withEnglishOnlyEnv({ I18N_ENGLISH: "true" }, () => {
      expect(getSourceConfig()).toMatchObject({
        define: {
          __ZSV_ENGLISH_ONLY__: "true",
        },
      });
    });
  });

  it("recognizes the CI ENGLISH_ONLY checkbox as an English Only build", () => {
    withEnglishOnlyEnv({ ENGLISH_ONLY: "true" }, () => {
      expect(getSourceConfig()).toMatchObject({
        define: {
          __ZSV_ENGLISH_ONLY__: "true",
        },
      });
    });
  });

  it("does not enable English Only unless the CI checkbox or explicit env is true", () => {
    withEnglishOnlyEnv({}, () => {
      expect(getSourceConfig()).toMatchObject({
        define: {
          __ZSV_ENGLISH_ONLY__: "false",
        },
      });
    });
  });

  it("copies only the ZSV English locale asset in English Only mode", () => {
    withEnglishOnlyEnv({ I18N_ENGLISH: "true" }, () => {
      expect(getI18nCopyConfig()).toEqual([
        {
          from: "node_modules/@zstack/i18n/src/zstack/zsv/locale/en-US.json",
          to: "i18n/zstack/zsv/locale/en-US.json",
        },
      ]);
    });
  });
});
