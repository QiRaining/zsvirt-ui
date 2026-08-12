import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { attachGuestToolsIsoToVm } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { Steps } from "@zstack/zsphere-components";
import { CopyableText, DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type {
  AttachGuestToolsIsoToVmPayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { useToggle } from "ahooks";
import cls from "classnames";
import type { FC } from "react";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useOpenConsoleAction from "../../action/open-console";

import styles from "./style.module.less";

// Style constants
const ICON_MARGIN_LEFT_STYLE = { marginLeft: 4 } as const;
const NOWRAP_INLINE_FLEX_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
} as const;

const { Step } = Steps;
interface IProps {
  detail: IVM;
  refetch?: () => void;
  //setToolsState?: (v: any) => void
  toolsState?: any;
}

interface IGuestToolsProps extends IProps {
  visible: boolean;
  setVisible: any;
}

const CDROM_LIST_QUERY = gql`
  query cdromList($conditions: [Condition!], $start: Int, $limit: Int) {
    cdromList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
    ) {
      total
      list {
        deviceId
        occupant
        isoName
      }
    }
  }
`;

export const GuestTools: FC<IGuestToolsProps> = ({
  detail,
  visible,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [loading, { toggle: toggleLoading }] = useToggle(false);
  // const [currentStep, next] = useReducer(state => state + 1, 0)
  const [currentStep, setCurrentStep] = useState(0);

  const isFirstStep = currentStep === 0;
  const isFreeBsd = detail.guestOsType === "FreeBSD";
  const isLinux = detail.platform === "Linux";
  const isWindows = detail.platform === "Windows";

  const [queryCdromList, { data: cdromListData }] = useLazyQuery(
    CDROM_LIST_QUERY,
    {
      fetchPolicy: "network-only",
    },
  );

  useEffect(() => {
    if (visible && detail.uuid) {
      queryCdromList({
        variables: {
          conditions: [
            {
              key: "vmInstance.uuid",
              op: Op.eq,
              value: detail.uuid,
            },
          ],
          start: 0,
          limit: 10,
        },
      });
    }
  }, [detail?.uuid, visible]);
  //
  const commandNum = useMemo(() => {
    const { list = [] } = cdromListData?.cdromList || {};
    return (
      list.find((item: any) => item.occupant === "GuestTools")?.deviceId || 0
    );
  }, [cdromListData]);

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const okText = useMemo(() => {
    if (isFirstStep && !isFreeBsd) {
      return intl.formatMessage({
        id: "vm.modal.install.GuestTools.go.to.next.step",
        defaultMessage: "Next: Install on VM Console",
      });
    }
    if (isLinux || isFreeBsd) {
      return (
        <span style={NOWRAP_INLINE_FLEX_STYLE}>
          {intl.formatMessage({
            id: "vm.modal.install.GuestTools.copy.and.go.to.console",
            defaultMessage: "Copy Commands and Launch Console",
          })}
          <Icon type="external-link" style={ICON_MARGIN_LEFT_STYLE} />
        </span>
      );
    }

    if (isFirstStep && !isFreeBsd) {
      return (
        <span style={NOWRAP_INLINE_FLEX_STYLE}>
          {intl.formatMessage({
            id: "vm.modal.install.GuestTools.enter.console.and.run.commands",
            defaultMessage: "Run Commands on the Console",
          })}
          <Icon type="external-link" style={ICON_MARGIN_LEFT_STYLE} />
        </span>
      );
    }

    return intl.formatMessage({
      id: "ok",
      defaultMessage: "OK",
    });
  }, [intl, isFirstStep, isFreeBsd, isLinux]);

  const copyToClipboard = useCallback(
    (type: "Linux" | "FreeBSD") => {
      const copyTextMap = {
        Linux: `mkdir /mnt/cdrom
mount /dev/sr${commandNum} /mnt/cdrom
cd /mnt/cdrom/
bash ./zs-tools-install.sh
cd ~
umount /mnt/cdrom
`,
        FreeBSD: `curl http://169.254.169.254/vm-tools.sh -o vm-tools.sh & bash -x ./vm-tools.sh`,
      };

      const inputEl = document.body.appendChild(
        document.createElement("textarea"),
      );
      inputEl.value = copyTextMap[type];
      inputEl.focus();
      inputEl.select();
      // navigator.clipboard.writeText(copyTextMap[type])
      // 回退回去
      document.execCommand("copy");
      inputEl.parentNode?.removeChild(inputEl);
    },
    [commandNum],
  );

  const openConsole = useOpenConsoleAction();

  const installVmTools = () =>
    new Promise((resolve, reject) => {
      const payload: AttachGuestToolsIsoToVmPayload = {
        uuid: detail?.uuid,
      };
      doAction({
        mutation: attachGuestToolsIsoToVm,
        payload,
        name: intl.formatMessage({
          id: "attachGuestToolsIsoToVm",
          defaultMessage: "Install VMTools ISO",
        }),
        total: 1,
        type: "GuestToolsIso",
        onProgress: (result) => {
          if (result.error) {
            setVisible(false);
            reject();
          }
        },
        onFinish: () => {
          resolve("");
          refetch?.();
        },
      });
    });

  if (detail?.state !== VmInstanceState.Running) {
    return (
      <DialogBase
        title={String(
          intl.formatMessage({
            id: "vm.modal.install.Guesttools.warning",
            defaultMessage: "Cannot Install VMTools.",
          }),
        )}
        visible={visible}
        setVisible={setVisible}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => {
              setVisible(false);
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        {intl.formatMessage({
          id: "vm.modal.install.Guesttools.alert",
          defaultMessage:
            "GuestTools cannot be installed on virtual machines that are not in the running state. To install GuestTools, ensure that virtual machines must be in the running state.",
        })}
      </DialogBase>
    );
  }

  if ((detail?.vmCdRoms?.length ?? 0) <= 0 || !detail?.vmCdRoms) {
    return (
      <DialogBase
        title={String(
          intl.formatMessage({
            id: "vm.modal.install.Guesttools.warning",
            defaultMessage: "Cannot Install VMTools.",
          }),
        )}
        visible={visible}
        setVisible={setVisible}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => {
              setVisible(false);
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        {intl.formatMessage({
          id: "vm.modal.install.Guesttools.alert.case1",
          defaultMessage:
            "No CD/DVD drive detected. Add a CD/DVD drive to this virtual machine before performing this operation.",
        })}
      </DialogBase>
    );
  }

  const Article = ({
    message,
    description,
  }: {
    message: React.ReactNode;
    description?: React.ReactNode;
  }) => {
    return (
      <div className={styles.article}>
        <span className={styles.msg}>
          <i />
          <span>{message}</span>
        </span>
        {description && <span className={styles.desc}>{description}</span>}
      </div>
    );
  };

  const isoInstallModal = (
    <DialogBase
      title={String(
        intl.formatMessage({
          id: "vm.modal.install.GuestTools.title",
          defaultMessage: "Install VMTools",
        }),
      )}
      visible={visible}
      setVisible={setVisible}
      footer={
        <div className="flex gap-2">
          <Button
            variant="primary"
            loading={loading}
            onClick={() => {
              if (isFirstStep && !isFreeBsd) {
                toggleLoading();
                installVmTools()
                  .then(() => {
                    setCurrentStep((pre) => pre + 1);
                  })
                  .finally(toggleLoading);
              } else {
                if (isLinux) {
                  copyToClipboard("Linux");
                }
                if (isFreeBsd) {
                  copyToClipboard("FreeBSD");
                }
                openConsole(detail);
                setVisible(false);
              }
            }}
          >
            {okText}
          </Button>
        </div>
      }
    >
      <div>
        {!isFreeBsd && (
          <div className={cls(styles["step-wrap"], styles["step-wrap-zsv"])}>
            <Steps progressDot current={currentStep} direction="horizontal">
              <Step
                title={intl.formatMessage({
                  id: "iso.install",
                  defaultMessage: "Install ISO",
                })}
              />
              <Step
                title={intl.formatMessage({
                  id: "console.install",
                  defaultMessage: "Install on VM Console",
                })}
              />
            </Steps>
          </div>
        )}
        <div
          className={cls(styles["content-wrap"], styles["content-wrap-zsv"])}
        >
          {isFreeBsd && (
            <>
              <Article
                message={intl.formatMessage({
                  id: "vm.modal.install.GuestTools.iso.install.info.freebsd.info1",
                  defaultMessage:
                    "VMTools consists of several tools and drivers, including QGA, Cloudbase-Init, advanced monitoring agent, and VirtIO driver.",
                })}
              />
              <Article
                message={intl.formatMessage({
                  id: "vm.modal.install.GuestTools.iso.install.freebsd.info2",
                  defaultMessage: "To install GuestTools, enter the VM console and run following commands as a Root user:",
                })}
                description={
                  <CopyableText>
                    curl http://169.254.169.254/vm-tools.sh -o vm-tools.sh &
                    bash -x ./vm-tools.sh
                  </CopyableText>
                }
              />
            </>
          )}
          {!isFreeBsd && isFirstStep && (
            <>
              <Article
                message={intl.formatMessage({
                  id: "vm.modal.install.GuestTools.iso.install.info.1",
                  defaultMessage:
                    "VMTools consists of several tools and drivers, including QGA, Cloudbase-Init, advanced monitoring agent, and VirtIO driver.",
                })}
              />
              <Article
                message={intl.formatMessage({
                  id: "vm.modal.install.GuestTools.iso.install.info.2",
                  defaultMessage:
                    "VMTools installation consists of two steps: Install ISO and Install on VM Console.",
                })}
              />
              <Article
                message={intl.formatMessage(
                  {
                    id: "vm.modal.install.GuestTools.iso.install.info.3",
                    defaultMessage:
                      "When attaching the VMTools ISO, the system automatically chooses a CD/DVD drive based on the {selectionRule}.",
                  },
                  {
                    selectionRule: (
                      <Tooltip
                        title={
                          <ReactMarkdown>
                            {intl.formatMessage({
                              id: "install.vmtools.modal.cdrom.selection.rule.tooltip",
                              defaultMessage:
                                "### Selection Rules\n\nThe CD/DVD drive selections follow these rules:\n\n- When a CD/DVD drive is available, the system automatically selects the first one and attaches the VMTools ISO.\n- When no CD/DVD drive is available, the system automatically detaches the original image on CD/DVD drive 1 and attach the VMTools ISO.",
                            })}
                          </ReactMarkdown>
                        }
                      >
                        <a>
                          {intl.formatMessage({
                            id: "install.vmtools.modal.cdrom.selection.rule.link",
                            defaultMessage: "Selection Rules",
                          })}
                        </a>
                      </Tooltip>
                    ),
                  },
                )}
              />
            </>
          )}
          {!isFreeBsd && !isFirstStep && (
            <>
              <div className={styles.stepHeader}>
                {isWindows
                  ? intl.formatMessage({
                      id: "vm.modal.install.GuestTools.info.windows.plz.enter.console",
                      defaultMessage: "Execute the following actions on the VM console:",
                    })
                  : intl.formatMessage({
                      id: "vm.modal.install.GuestTools.info.plz.enter.console",
                      defaultMessage: "Run the following commands on the VM console",
                    })}
                :
              </div>
              {isLinux && (
                <Steps progressDot direction="vertical">
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "create.mount.point.dir",
                      defaultMessage: "Create a mount point",
                    })}
                    description={<CopyableText>mkdir /mnt/cdrom</CopyableText>}
                  />
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "mout.cd.rom.image",
                      defaultMessage: "Mount the CD-ROM image",
                    })}
                    description={
                      <CopyableText>{`mount /dev/sr${commandNum} /mnt/cdrom`}</CopyableText>
                    }
                  />
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "install.guestTools",
                      defaultMessage: "Install VMTools",
                    })}
                    description={
                      <>
                        <CopyableText>cd /mnt/cdrom/</CopyableText>
                        <CopyableText>bash ./zs-tools-install.sh</CopyableText>
                      </>
                    }
                  />
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "uninstall.cd.rom.image",
                      defaultMessage: "Unmount the CD-ROM image (Optional)",
                    })}
                    description={
                      <>
                        <CopyableText>cd ~</CopyableText>
                        <CopyableText>umount /mnt/cdrom</CopyableText>
                      </>
                    }
                  />
                </Steps>
              )}
              {isWindows && (
                <Steps progressDot direction="vertical">
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "attach.GuestTools.image",
                      defaultMessage: "Load VMTools image",
                    })}
                    description={intl.formatMessage({
                      id: "vm.modal.install.GuestTools.windows.step1",
                      defaultMessage:
                        "Click install VMTools in the VMTools installation prompt to load the image to the virtual CD Drive.",
                    })}
                  />
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "install.GuestTools.Virtio",
                      defaultMessage: "Install VMTools",
                    })}
                    description={intl.formatMessage({
                      id: "vm.modal.install.GuestTools.windows.step2",
                      defaultMessage:
                        "Run the VMTools installation program and install VMTools, commonly-used tools, and VirtIO.",
                    })}
                  />
                  <Step
                    status="process"
                    className="ant-steps-item-active"
                    title={intl.formatMessage({
                      id: "confirm.and.restart.compute",
                      defaultMessage: "Confirm the installation and reboot the virtual machine",
                    })}
                    description={intl.formatMessage({
                      id: "vm.modal.install.GuestTools.windows.step3",
                      defaultMessage:
                        "Reboot the virtual machine to make the modification take effect after the installation.",
                    })}
                  />
                </Steps>
              )}
            </>
          )}
        </div>
      </div>
    </DialogBase>
  );

  return isoInstallModal;
};
