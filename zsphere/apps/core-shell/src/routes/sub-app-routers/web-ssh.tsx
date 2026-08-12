import * as React from "react";
import { Route } from "react-router";

import AppLayoutWrapper from "../components/app-layout-wrapper.tsx";
import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";

const WebSshIndex = React.lazy(() => import("zsv_web_ssh/web-ssh/index"));

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

export const webSshRoutes = (
  <Route path="web-ssh" element={<AppLayoutWrapper />}>
    <Route path="web-ssh" element={withSuspense(WebSshIndex)} />
  </Route>
);

export default webSshRoutes;
