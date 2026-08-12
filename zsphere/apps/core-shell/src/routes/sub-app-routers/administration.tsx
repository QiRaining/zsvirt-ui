import { useUserIdentity } from "@zstack/zsphere-hooks";
import * as React from "react";
import { Navigate, Route } from "react-router";

import AppLayoutWrapper from "../components/app-layout-wrapper.tsx";
import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";

const AccessControlRuleIndex = React.lazy(
  () => import("zsv_administration/src/pages/access-control-rule"),
);
const AccessControlRuleList = React.lazy(
  () => import("zsv_administration/src/pages/access-control-rule/list"),
);
const AccesskeyManagementIndex = React.lazy(
  () => import("zsv_administration/src/pages/accesskey-management"),
);
const AccesskeyManagementList = React.lazy(
  () => import("zsv_administration/src/pages/accesskey-management/list"),
);
const AccountInformationIndex = React.lazy(
  () => import("zsv_administration/src/pages/account-information"),
);
const AccountInformationUserDetail = React.lazy(
  () => import("zsv_administration/src/pages/account-information/user/detail"),
);
const AccountInformationUserGroupDetail = React.lazy(
  () =>
    import("zsv_administration/src/pages/account-information/user-group/detail"),
);
const AccountThirdPartyAuthIndex = React.lazy(
  () => import("zsv_administration/src/pages/account-third-party-auth"),
);
const AccountThirdPartyAuthDetail = React.lazy(
  () => import("zsv_administration/src/pages/account-third-party-auth/detail"),
);
const CertificateManagementIndex = React.lazy(
  () => import("zsv_administration/src/pages/certificate-management"),
);
const CertificateManagementDetail = React.lazy(
  () => import("zsv_administration/src/pages/certificate-management/detail"),
);
const ConsoleProxyIndex = React.lazy(
  () => import("zsv_administration/src/pages/console-proxy"),
);
const EmailServerIndex = React.lazy(
  () => import("zsv_administration/src/pages/email-server"),
);
const EmailServerList = React.lazy(
  () => import("zsv_administration/src/pages/email-server/list"),
);
const EmailServerDetail = React.lazy(
  () => import("zsv_administration/src/pages/email-server/detail"),
);
const LicenseManagementIndex = React.lazy(
  () => import("zsv_administration/src/pages/license-management"),
);
const LogServerIndex = React.lazy(
  () => import("zsv_administration/src/pages/log-server"),
);
const LogServerList = React.lazy(
  () => import("zsv_administration/src/pages/log-server/list"),
);
const LogServerDetail = React.lazy(
  () => import("zsv_administration/src/pages/log-server/detail"),
);
const LoginPolicyIndex = React.lazy(
  () => import("zsv_administration/src/pages/login-policy"),
);
const RoleIndex = React.lazy(() => import("zsv_administration/src/pages/role"));
const RoleList = React.lazy(
  () => import("zsv_administration/src/pages/role/list"),
);
const RoleCreate = React.lazy(
  () => import("zsv_administration/src/pages/role/create"),
);
const RoleDetail = React.lazy(
  () => import("zsv_administration/src/pages/role/detail"),
);
const SnmpManagementIndex = React.lazy(
  () => import("zsv_administration/src/pages/snmp-management"),
);
const SnmpManagementDetail = React.lazy(
  () => import("zsv_administration/src/pages/snmp-management/detail"),
);
const SnmpTrapList = React.lazy(
  () => import("zsv_administration/src/pages/snmp-trap/list"),
);
const SystemParameterIndex = React.lazy(
  () => import("zsv_administration/src/pages/system-parameter"),
);
const TimeServerIndex = React.lazy(
  () => import("zsv_administration/src/pages/time-server"),
);
const TelemetryIndex = React.lazy(
  () => import("zsv_administration/src/pages/telemetry"),
);
const NotFoundPage = React.lazy(
  () => import("zsv_administration/src/pages/404"),
);

type LazyComponent = React.LazyExoticComponent<React.ComponentType<unknown>>;

const withSuspense = (Component: LazyComponent) => (
  <SuspenseWrapper>
    <Component />
  </SuspenseWrapper>
);

const SystemAdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { isSystemAdmin } = useUserIdentity();

  return isSystemAdmin ? children : <Navigate to="/exception/401" replace />;
};

export const administrationRoutes = (
  <Route path="virtualization-administration" element={<AppLayoutWrapper />}>
    <Route index element={<Navigate to="account-information" replace />} />

    <Route path="access-control-rule">
      <Route index element={withSuspense(AccessControlRuleIndex)} />
      <Route path="list" element={withSuspense(AccessControlRuleList)} />
    </Route>

    <Route path="accesskey-management">
      <Route index element={withSuspense(AccesskeyManagementIndex)} />
      <Route path="list" element={withSuspense(AccesskeyManagementList)} />
    </Route>

    <Route path="account-information">
      <Route index element={withSuspense(AccountInformationIndex)} />
      <Route
        path="user/detail"
        element={withSuspense(AccountInformationUserDetail)}
      />
      <Route
        path="user-group/detail"
        element={withSuspense(AccountInformationUserGroupDetail)}
      />
    </Route>

    <Route path="account-third-party-auth">
      <Route index element={withSuspense(AccountThirdPartyAuthIndex)} />
      <Route path="list" element={withSuspense(AccountThirdPartyAuthIndex)} />
      <Route
        path="detail"
        element={withSuspense(AccountThirdPartyAuthDetail)}
      />
    </Route>

    <Route path="certificate-management">
      <Route index element={withSuspense(CertificateManagementIndex)} />
      <Route
        path="detail"
        element={withSuspense(CertificateManagementDetail)}
      />
    </Route>

    <Route path="console-proxy" element={withSuspense(ConsoleProxyIndex)} />

    <Route path="email-server">
      <Route index element={withSuspense(EmailServerIndex)} />
      <Route path="list" element={withSuspense(EmailServerList)} />
      <Route path="detail" element={withSuspense(EmailServerDetail)} />
    </Route>

    <Route
      path="license-management"
      element={withSuspense(LicenseManagementIndex)}
    />

    <Route path="log-server">
      <Route index element={withSuspense(LogServerIndex)} />
      <Route path="list" element={withSuspense(LogServerList)} />
      <Route path="detail" element={withSuspense(LogServerDetail)} />
    </Route>

    <Route path="login-policy" element={withSuspense(LoginPolicyIndex)} />

    <Route path="role">
      <Route index element={withSuspense(RoleIndex)} />
      <Route path="list" element={withSuspense(RoleList)} />
      <Route path="create" element={withSuspense(RoleCreate)} />
      <Route path="detail" element={withSuspense(RoleDetail)} />
    </Route>

    <Route path="snmp-management">
      <Route index element={withSuspense(SnmpManagementIndex)} />
      <Route path="detail" element={withSuspense(SnmpManagementDetail)} />
    </Route>

    <Route path="snmp-trap">
      <Route path="list" element={withSuspense(SnmpTrapList)} />
    </Route>

    <Route path="system-parameter">
      <Route index element={withSuspense(SystemParameterIndex)} />
      <Route path="list" element={withSuspense(SystemParameterIndex)} />
    </Route>

    <Route path="time-server" element={withSuspense(TimeServerIndex)} />

    <Route
      path="telemetry"
      element={
        <SystemAdminOnly>{withSuspense(TelemetryIndex)}</SystemAdminOnly>
      }
    />

    <Route path="*" element={withSuspense(NotFoundPage)} />
  </Route>
);

export default administrationRoutes;
