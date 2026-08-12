import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { GuestTools } from "@zstack/virtualization-resource/src/pages/vm/components/configuration-info";
import {
  Constant,
  DraggableCard,
  List,
  ResourceName,
  useAuth,
  useSetTab,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import {
  GuestToolsState,
  ImageBootMode,
  VmBootDevice,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { vmConsoleModeMap } from "../../utils";

import style from "./style.module.less";

const FLEX_STYLE = { display: "flex" } as const;
const MARGIN_LEFT_4_STYLE = { marginLeft: "4px" } as const;
const ICON_ALERT_STYLE = { marginLeft: "8px", marginTop: "5px" } as const;

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const PropertyConfig: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [visible, setVisible] = useState(false);

  const canInstallTools = hasAuth({
    authKey: "virtualization.install.guest.tool",
    resource: "vm",
    type: "action",
  });
  const { setTab } = useSetTab();

  const transformBootOrder = (order: VmBootDevice) => {
    switch (order) {
      case VmBootDevice.CdRom:
        return intl.formatMessage({
          id: "vm.bootOrder.cdrom",
          defaultMessage: "CD/DVD Drive",
        });
      case VmBootDevice.HardDisk:
        return intl.formatMessage({ id: "osd", defaultMessage: "Disk" });
      case VmBootDevice.Network:
        return intl.formatMessage({ id: "network", defaultMessage: "Network" });
    }
  };

  const crashStrategyMap: any = {
    None: intl.formatMessage({ id: "close", defaultMessage: `Disabled` }),
    Preserve: intl.formatMessage({ id: "Preserve", defaultMessage: "No Action" }),
    Shutdown: intl.formatMessage({ id: "Shutdown", defaultMessage: "Shutdown" }),
    Reboot: intl.formatMessage({ id: "Reboot", defaultMessage: "Reboot" }),
  };

  const displayBootMode = useMemo(() => {
    if (detail.systemTag?.bootMode) {
      return detail.systemTag?.bootMode === ImageBootMode.UEFI_WITH_CSM
        ? ImageBootMode.UEFI
        : detail.systemTag?.bootMode;
    }
    return ImageBootMode.Legacy;
  }, [detail.systemTag?.bootMode]);

  const list = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "console.mode",
          defaultMessage: "Console Mode",
        }),
        value: vmConsoleModeMap(
          detail.systemTag?.vmConsoleMode as string,
          detail.consoleAddress,
        ),
      },
      {
        label: intl.formatMessage({ id: "vm.tool", defaultMessage: "VMtools" }),
        value: (
          <div className="flex items-center">
            <div style={{ flex: 1 }}>
              <div style={FLEX_STYLE}>
                <Constant
                  value={
                    (detail.toolsState ?? GuestToolsState.Uninstall) as any
                  }
                  enumType={ConstantType.GuestToolsState}
                />

                {detail.toolsState === GuestToolsState.Installed &&
                  detail.toolsInfo?.version && (
                    <span style={MARGIN_LEFT_4_STYLE}>
                      {intl.formatMessage(
                        {
                          id: "vm.field.vmGuesttool.tip",
                          defaultMessage: "(Version: {version})",
                        },
                        { version: detail.toolsInfo?.version },
                      )}
                    </span>
                  )}

                {detail.toolsInfo?.lowVersion && (
                  <Tooltip
                    title={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "vm.field.vmTools.lowVersion.icon.tooltip",
                          defaultMessage:
                            "The current version of VMTools is too low, which may lead to some features being unavailable. Please upgrade VMTools.",
                        })}
                      </ReactMarkdown>
                    }
                  >
                    <Icon
                      style={ICON_ALERT_STYLE}
                      type="alert-triangle-fill"
                      color="alert"
                    />
                  </Tooltip>
                )}
              </div>
            </div>
            {canInstallTools && (
              <div
                className={cls(style["action-link"], {
                  [style.disabled]:
                    detail.toolsState === GuestToolsState.Unsupport,
                })}
                onClick={() => {
                  if (detail.toolsState !== GuestToolsState.Unsupport) {
                    setVisible(true);
                  }
                }}
              >
                {detail.toolsState === GuestToolsState.Uninstall ||
                detail.toolsState === GuestToolsState.Unsupport
                  ? intl.formatMessage({
                      id: "install",
                      defaultMessage: "Install",
                    })
                  : intl.formatMessage({
                      id: "re.install",
                      defaultMessage: "Reinstall",
                    })}
              </div>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "timeSync",
          defaultMessage: "Time Synchronization",
        }),
        value:
          detail?.systemTag?.timeTrack !== "0"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "vmCrashStrategy",
          defaultMessage: "Failure Response Policy",
        }),
        value: crashStrategyMap[detail.crashStrategy!],
      },
      {
        label: intl.formatMessage({
          id: "vm.bootOrder",
          defaultMessage: "Boot Order",
        }),
        value: detail.bootOrder?.orders
          .map((it) => transformBootOrder(it))
          .join(">"),
      },
      {
        label: intl.formatMessage({
          id: "biosMode",
          defaultMessage: "BIOS Mode",
        }),
        value: displayBootMode,
      },
      {
        label: intl.formatMessage({ id: "ssh.key", defaultMessage: "SSH Key" }),
        value: (
          <ResourceName
            value={detail.systemTag?.sshkey || undefined}
            canModify
          />
        ),
      },
    ],
    [detail, intl, displayBootMode],
  );
  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={[
          {
            icon: "external-link",
            tooltip: intl.formatMessage({
              id: "see.more",
              defaultMessage: "More",
            }),
            onClick: () => setTab("main-tab", "setting"),
          },
        ]}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <GuestTools detail={detail} visible={visible} setVisible={setVisible} />
    </>
  );
};

export default PropertyConfig;
