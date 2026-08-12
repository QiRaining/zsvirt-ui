import React, { memo } from "react";
import { Route, Routes } from "react-router";

import LoginRedirectModal from "./components/login-redirect-modal.tsx";
import { SuspenseWrapper } from "./components/suspense-wrapper.tsx";
import { SyncBrowserRouter } from "./components/sync-browser-router.tsx";
import { administrationRoutes } from "./sub-app-routers/administration.tsx";
import { dataProtectionRoutes } from "./sub-app-routers/data-protection.tsx";
import { monitoringOmRoutes } from "./sub-app-routers/monitoring-om.tsx";
import { novncRoutes } from "./sub-app-routers/novnc.tsx";
import { reliabilityRoutes } from "./sub-app-routers/reliability.tsx";
//子应用路由
import { resourceRoutes } from "./sub-app-routers/resource.tsx";
import { webSshRoutes } from "./sub-app-routers/web-ssh.tsx";
import { wizardRoutes } from "./sub-app-routers/wizard.tsx";
import { zmigrateRoutes } from "./sub-app-routers/zmigrate-routes.tsx";

const BasicLayout = React.lazy(() => import("../layouts/index"));
const DashboardInex = React.lazy(() => import("zsv_dashboard/index"));
const Login = React.lazy(() => import("../pages/login"));
const OAuth1Verify = React.lazy(() => import("../pages/oauth1/verify"));
const InspectorPopup = React.lazy(() => import("../pages/inspector-popup"));

import { exceptionRoutes, Exception404 } from "./exception-routes";

export const Router = memo(() => {
  return (
    <SyncBrowserRouter>
      <Routes>
        <Route
          path="/inspector-popup"
          element={
            <SuspenseWrapper>
              <InspectorPopup />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <SuspenseWrapper>
              <Login />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/oauth1/verify"
          element={
            <SuspenseWrapper>
              <OAuth1Verify />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/sso/verify"
          element={
            <SuspenseWrapper>
              <OAuth1Verify />
            </SuspenseWrapper>
          }
        />
        {exceptionRoutes}
        <Route
          path="/"
          element={
            <SuspenseWrapper>
              <BasicLayout />
            </SuspenseWrapper>
          }
        >
          <Route
            path="virtualization-dashboard"
            element={
              <SuspenseWrapper>
                <DashboardInex />
              </SuspenseWrapper>
            }
          />
          {resourceRoutes}
          {dataProtectionRoutes}
          {reliabilityRoutes}
          {monitoringOmRoutes}
          {administrationRoutes}
          {webSshRoutes}
          {novncRoutes}
          {wizardRoutes}
          {zmigrateRoutes}
          {/* 捕获所有未匹配的路由，跳转到404页面 */}
          <Route path="*" element={<Exception404 />} />
        </Route>
      </Routes>
      <LoginRedirectModal />
    </SyncBrowserRouter>
  );
});

Router.displayName = "Router";
