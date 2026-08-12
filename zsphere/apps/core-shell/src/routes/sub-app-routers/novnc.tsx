import * as React from "react";
import { Route } from "react-router";

import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";
const NovncIndex = React.lazy(() => import("zsv_novnc/novnc/index"));
const NovncVmwareIndex = React.lazy(() => import("zsv_novnc/novnc/vmware"));

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

export const novncRoutes = (
  <>
    <Route path="novnc" element={withSuspense(NovncIndex)} />
    <Route path="novnc/vmware" element={withSuspense(NovncVmwareIndex)} />
  </>
);

export default novncRoutes;
