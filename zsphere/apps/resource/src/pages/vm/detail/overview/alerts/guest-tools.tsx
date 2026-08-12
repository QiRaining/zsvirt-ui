import { useLazyQuery } from "@apollo/client";
import { guestToolsInfoInVMDetail } from "@zstack/virtualization-resource/src/gql/instance.gql";
import { GuestTools } from "@zstack/virtualization-resource/src/pages/vm/components/configuration-info";
import { useAuth } from "@zstack/zsphere-components";
import { Alert } from "@zstack/zsphere-design-biz";
import { GuestToolsState, VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

const ALERT_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: IVM;
  setEditConfigVisible?: (visible: boolean) => void;
}

const VmToolsAlert: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [vmToolVisible, setVmToolVisible] = useState(false);

  const canInstallTools = hasAuth({
    authKey: "virtualization.install.guest.tool",
    resource: "vm",
    type: "action",
  });

  // 防止反复请求

  const [getGuestToolsInfo, { data }] = useLazyQuery(guestToolsInfoInVMDetail, {
    fetchPolicy: "no-cache",
  });

  const vmUuid = useMemo(() => current?.uuid, [current]);

  useEffect(() => {
    if (vmUuid) {
      getGuestToolsInfo({
        variables: {
          uuid: vmUuid,
        },
      });
    }
  }, [vmUuid, getGuestToolsInfo]);

  const vmToolsUninstallAlert = useMemo(() => {
    const showToolWarning =
      current.toolsState === GuestToolsState.Uninstall &&
      current.state === VmInstanceState.Running;

    if (showToolWarning) {
      return (
        <Alert
          variant="warning"
          closable
          style={ALERT_STYLE}
          guideAction={
            canInstallTools
              ? {
                  text: intl.formatMessage({
                    id: "go.intall.vmtools",
                    defaultMessage: "Install",
                  }),
                  onClick: () => setVmToolVisible(true),
                }
              : undefined
          }
        >
          {intl.formatMessage({
            id: "vmtool.warning",
            defaultMessage:
              "VMTools is not installed on this VM. Some monitoring data and VM configurations depend on this tool. It is recommended to install it in advance. ",
          })}
        </Alert>
      );
    }
    return null;
  }, [current, intl]);

  const vmToolsLowVersionAlert = useMemo(() => {
    if (data?.guestToolInfo?.lowVersion) {
      return (
        <Alert
          closable
          variant="warning"
          style={ALERT_STYLE}
          guideAction={
            canInstallTools
              ? {
                  text: intl.formatMessage({
                    id: "go.intall.vmtools",
                    defaultMessage: "Install",
                  }),
                  onClick: () => setVmToolVisible(true),
                }
              : undefined
          }
        >
          {intl.formatMessage({
            id: "vm.field.vmtools.low.version.alert.message",
            defaultMessage:
              "The current VMTools version is too low, which may cause some features to be unavailable. Please upgrade VMTools to the latest version.",
          })}
        </Alert>
      );
    }

    return null;
  }, [intl, data]);

  return (
    <>
      {vmToolsUninstallAlert}
      {vmToolsLowVersionAlert}
      <GuestTools
        detail={current}
        visible={vmToolVisible}
        setVisible={setVmToolVisible}
      />
    </>
  );
};

export default React.memo(VmToolsAlert);
