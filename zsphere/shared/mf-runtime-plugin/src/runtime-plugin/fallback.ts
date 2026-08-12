import type { ModuleFederationRuntimePlugin } from "@module-federation/enhanced/runtime";

import { createSimplePlugin } from "./error-handling";

interface FallbackConfig {
  // Backup service address
  backupEntryUrl?: string;
  // Custom error message i18n key
  errorMessageId?: string;
  // Custom error message default text
  errorMessageDefault?: string;
  // Error handling strategy: 'simple' | 'lifecycle-based'
  strategy?: "simple" | "lifecycle-based";
}

const fallbackPlugin = (
  config: FallbackConfig = {},
): ModuleFederationRuntimePlugin => {
  const {
    backupEntryUrl = "http://localhost:2002/mf-manifest.json",
    errorMessageId = "error.module.loading.description",
    errorMessageDefault = "Module loading failed, please try again later",
    strategy = "lifecycle-based",
  } = config;

  return createSimplePlugin({ errorMessageId, errorMessageDefault });

  // Use the selected error handling strategy
  // if (strategy === 'simple') {
  //   return createSimplePlugin({ errorMessage });
  // }

  // return createLifecycleBasedPlugin({
  //   backupEntryUrl,
  //   errorMessage,
  // });
};

export default fallbackPlugin;
