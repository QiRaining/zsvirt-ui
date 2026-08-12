import { ApolloProvider } from "@apollo/client";
import { OverlayProvider } from "@zstack/design";
import {
  ConfigEmptyProvider,
  ConfigProvider,
} from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";

import { WizardContainer } from "./wizard-container/wizard-container";

export default function WizardIndex() {
  const { apolloClient } = usePlatformStore();
  return (
    <ConfigEmptyProvider>
      <ConfigProvider>
        <ApolloProvider client={apolloClient}>
          <OverlayProvider>
            <WizardContainer />
          </OverlayProvider>
        </ApolloProvider>
      </ConfigProvider>
    </ConfigEmptyProvider>
  );
}
