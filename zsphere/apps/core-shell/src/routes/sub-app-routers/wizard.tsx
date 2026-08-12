import React from "react";
import { Route } from "react-router";

import { SuspenseWrapper } from "../components/suspense-wrapper";

const WizardIndex = React.lazy(() => import("zsv_wizard/layouts/index"));

export const wizardRoutes = (
  <Route
    path="virtualization-wizard"
    element={
      <SuspenseWrapper>
        <WizardIndex />
      </SuspenseWrapper>
    }
  />
);
