import { useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Text,
  Divider,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { Icon } from "@zstack/icon";
import {
  getHostPowerControlRelatedSummary,
  updateHostPowerStatus,
} from "@zstack/virtualization-resource/src/gql/host.gql";
import { DialogForm, DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  HostIPMIPowerStatus,
  HostState,
  NodeType,
  UpdateHostPowerStatus,
} from "@zstack/zsphere-types";
import type {
  HostPowerControlRelatedSummary,
  HostVO as IHost,
} from "@zstack/zsphere-types/graphql";
import cs from "classnames";
import React from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createHostPowerControlSchema,
  type HostPowerControlFormValues,
} from "./schema";

import styles from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, className, ...rest }, ref) => {
  return (
    <label className="flex w-fit cursor-pointer items-center text-sm !text-neutral-700">
      <Checkbox
        ref={ref}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        className={className}
        {...rest}
      />
      {label && <span className="pl-2">{label}</span>}
    </label>
  );
});

const ZSVBaseAction: React.FC<
  IActionWrapperProps<IHost> & {
    powerControlType: UpdateHostPowerStatus;
  }
> = ({
  visible,
  refetch,
  setVisible,
  selectedList = [],
  originSelectedList = [],
  setSelectedList,
  powerControlType,
}) => {
  const isSingleSelected = !!(
    originSelectedList?.length && originSelectedList?.length === 1
  );

  const [_getHostPowerControlRelatedSummary, { data }] = useLazyQuery<{
    getHostPowerControlRelatedSummary: HostPowerControlRelatedSummary;
  }>(getHostPowerControlRelatedSummary);

  const intl = useIntl();
  const doAction = useAction();
  const [innerVisible, setInnerVisible] = React.useState(false);
  const [confirmVisible, setConfirmisible] = React.useState(false);

  const confirmInputText = React.useMemo(() => {
    if (powerControlType === UpdateHostPowerStatus.PowerOn) {
      return "Power On";
    }
    if (powerControlType === UpdateHostPowerStatus.PowerOff) {
      return "Power Off";
    }
    return "Power Reboot";
  }, [powerControlType]);

  const okText = React.useMemo(() => {
    if (powerControlType === UpdateHostPowerStatus.PowerOn) {
      return intl.formatMessage({
        id: "confirm.power.on.host.txt",
        defaultMessage: "Confirmation to start.",
      });
    }
    if (powerControlType === UpdateHostPowerStatus.PowerOff) {
      return intl.formatMessage({
        id: "confirm.power.off.host.txt",
        defaultMessage: "Shut down confirmation.",
      });
    }
    return intl.formatMessage({
      id: "confirm.power.reboot.host.txt",
      defaultMessage: "Restart Confirmation",
    });
  }, [powerControlType]);

  const actionName = React.useMemo(() => {
    if (powerControlType === UpdateHostPowerStatus.PowerOn) {
      return intl.formatMessage({
        id: "power.on.host",
        defaultMessage: "Power on Host",
      });
    }
    if (powerControlType === UpdateHostPowerStatus.PowerOff) {
      return intl.formatMessage({
        id: "power.off.host",
        defaultMessage: "Power off Host",
      });
    }
    return intl.formatMessage({
      id: "power.reboot.host",
      defaultMessage: "Restart Host",
    });
  }, [intl, powerControlType]);

  const modalData = React.useMemo(() => {
    switch (powerControlType) {
      case UpdateHostPowerStatus.PowerOn: {
        return {
          name: intl.formatMessage({
            id: "power.on.host",
            defaultMessage: "Power on Host",
          }),
        };
      }
      case UpdateHostPowerStatus.PowerOff: {
        return {
          name: intl.formatMessage({
            id: "power.off.host",
            defaultMessage: "Power off Host",
          }),
          confirmTitle: (
            <div className={styles.powerControlConfirmTitle}>
              <Icon
                type="alert-triangle-fill"
                color="alert"
                className={styles.icon}
              />
              {intl.formatMessage({
                id: "confirm.power.off.host",
                defaultMessage: "Power Off Host?",
              })}
            </div>
          ),
          title: intl.formatMessage({
            id: "confirm.power.off.host",
            defaultMessage: "Power Off Host?",
          }),
          confirmMessage: intl.formatMessage({
            id: "host.update.power.status.power.off.confirm.tip",
            defaultMessage:
              "Detected that this host is a management node. Powering it off may cause malfunction of the platform management node service and UI service and thus cause platform malfunction. If you do need to power off the management node, before you perform the operation, make sure the platform stability and security is not affected. ",
          }),
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.update.power.status.power.off.confirm.alert",
                defaultMessage: `1. Powering off a host may cause virtual machines and other resources running on the host powered off. To ensure your business stability and security, we recommend that you make the host enter the maintenance mode before you perform the operation.

2. If the host is used also as a Monitor node of  the distributed storage, powering it off will stop the monitor node service of the distributed storage, affect the stability of the storage cluster, and thus may cause data loss.`,
              })}
            </ReactMarkdown>
          ),
          checkBoxMsg: intl.formatMessage({
            id: "power.off.entering.maintenance.mode.checkbox.tip",
            defaultMessage: "Enter Maintenance Mode Before Power-off",
          }),
        };
      }
      case UpdateHostPowerStatus.PowerReboot: {
        return {
          name: intl.formatMessage({
            id: "power.reboot.host",
            defaultMessage: "Restart Host",
          }),
          confirmTitle: (
            <div className={styles.powerControlConfirmTitle}>
              <Icon
                type="alert-triangle-fill"
                color="alert"
                className={styles.icon}
              />
              {intl.formatMessage({
                id: "confirm.power.reboot.host",
                defaultMessage: "Reboot Host?",
              })}
            </div>
          ),
          title: intl.formatMessage({
            id: "confirm.power.reboot.host",
            defaultMessage: "Reboot Host?",
          }),
          confirmMessage: intl.formatMessage({
            id: "host.update.power.status.power.reboot.confirm.tip",
            defaultMessage:
              "Detected that this host is a management node. Restarting it may cause malfunction of the platform management node service and UI service. If you do need to restart the management node, before you perform the operation, make sure the platform stability and security is not affected.",
          }),
          alertMessage: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.update.power.status.power.reboot.confirm.alert",
                defaultMessage: `1. Rebooting a host may affect normal running of virtual machines and other resources on the host. To ensure your business stability and security, we recommend that you make the host enter the maintenance mode before you perform the operation.

2. If the host is also used as a monitor node of  the distributed storage, rebooting it will stop the monitor node service of the distributed storage, affect the stability of the storage cluster, and thus may cause data loss.`,
              })}
            </ReactMarkdown>
          ),
          checkBoxMsg: intl.formatMessage({
            id: "power.reboot.entering.maintenance.mode.checkbox.tip",
            defaultMessage: "Enter Maintenance Mode Before Reboot",
          }),
        };
      }
    }
  }, [intl, powerControlType]);

  const onOk = React.useCallback(
    async (values?: Partial<HostPowerControlFormValues>) => {
      if (powerControlType !== UpdateHostPowerStatus.PowerOn) {
        setInnerVisible(false);
      }
      setVisible(false);
      setSelectedList?.([]);

      const payload = selectedList.map((item) => {
        switch (powerControlType) {
          case UpdateHostPowerStatus.PowerOn: {
            return {
              uuid: item?.uuid,
              updateHostPowerStatus: UpdateHostPowerStatus.PowerOn,
            };
          }
          case UpdateHostPowerStatus.PowerOff: {
            return {
              uuid: item?.uuid,
              updateHostPowerStatus: UpdateHostPowerStatus.PowerOff,
              enteringMaintenanceMode: !!values?.enteringMaintenanceMode,
              //选择之后 force,stopHost === false
              stopHost: !values?.stopHost,
              state: item?.state,
              isManagementNode:
                item?.hostNodeInfo?.nodeType === NodeType.ManagementNode,
            };
          }
          // UpdateHostPowerStatus.PowerReboot
          default: {
            return {
              uuid: item?.uuid,
              updateHostPowerStatus: UpdateHostPowerStatus.PowerReboot,
              enteringMaintenanceMode: !!values?.enteringMaintenanceMode,
              state: item?.state,
              isManagementNode:
                item?.hostNodeInfo?.nodeType === NodeType.ManagementNode,
            };
          }
        }
      });

      let middleState;

      if (powerControlType === UpdateHostPowerStatus.PowerOn) {
        middleState = {
          type: "HostVO",
          field: "ipmiPowerStatus",
          data: { ipmiPowerStatus: HostIPMIPowerStatus.POWER_BOOTING },
          uuids: selectedList.map((host) => host.uuid),
        };
      } else if (powerControlType === UpdateHostPowerStatus.PowerOff) {
        middleState = {
          type: "HostVO",
          field: "ipmiPowerStatus",
          data: { ipmiPowerStatus: HostIPMIPowerStatus.POWER_SHUTDOWN },
          uuids: selectedList.map((host) => host.uuid),
        };
      }

      doAction({
        mutation: updateHostPowerStatus,
        payload,
        name: modalData.name,
        total: selectedList.length,
        middleState,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
        type: "HostVO",
      });
    },
    [
      powerControlType,
      setVisible,
      setSelectedList,
      selectedList,
      doAction,
      modalData.name,
      refetch,
    ],
  );
  const isShowStopHost = React.useMemo(() => {
    return (
      powerControlType === UpdateHostPowerStatus.PowerOff &&
      // 有一台是纳管状态: POWER_ON , POWER_BOOTING , POWER_SHUTDOWN
      selectedList?.some((host) => {
        return [
          HostIPMIPowerStatus.POWER_ON,
          HostIPMIPowerStatus.POWER_BOOTING,
          HostIPMIPowerStatus.POWER_SHUTDOWN,
        ].includes(host?.ipmiPowerStatus ?? -1);
      })
    );
  }, [selectedList, powerControlType]);

  const defaultValues = React.useMemo<HostPowerControlFormValues>(
    () => ({
      enteringMaintenanceMode: false,
      stopHost: isShowStopHost,
      acceptRisk: "",
    }),
    [isShowStopHost],
  );
  const formSchema = React.useMemo(
    () => createHostPowerControlSchema(intl, confirmInputText),
    [confirmInputText, intl],
  );
  const form = useForm<HostPowerControlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  React.useEffect(() => {
    if (visible) {
      switch (powerControlType) {
        case UpdateHostPowerStatus.PowerOn: {
          onOk();
          break;
        }
        case UpdateHostPowerStatus.PowerOff:
        case UpdateHostPowerStatus.PowerReboot: {
          _getHostPowerControlRelatedSummary({
            variables: {
              uuids: selectedList?.map((item) => item?.uuid) ?? [],
            },
          });

          if (
            isSingleSelected &&
            selectedList?.[0]?.hostNodeInfo?.nodeType ===
              NodeType.ManagementNode
          ) {
            setConfirmisible(true);
          } else {
            setInnerVisible(true);
          }
          break;
        }
      }
    }
  }, [
    _getHostPowerControlRelatedSummary,
    isSingleSelected,
    onOk,
    powerControlType,
    selectedList,
    visible,
    isShowStopHost,
  ]);

  React.useEffect(() => {
    if (innerVisible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, innerVisible]);

  const linkedResourceMsg = React.useMemo(() => {
    const {
      vm = 0,
      vpcRouter = 0,
      volume = 0,
      loadbalance = 0,
      cephLocalStorage = 0,
    } = data?.getHostPowerControlRelatedSummary ?? {};

    return intl.formatMessage(
      {
        id: "host.power.control.linked.resource",
        defaultMessage:
          "{vm} VMs, {volume} disks, and {cephLocalStorage} distributed storage are associated with the selected host.",
      },
      {
        vm: <span className={styles.alert}>{vm}</span>,
        vpcRouter: <span className={styles.alert}>{vpcRouter}</span>,
        volume: <span className={styles.alert}>{volume}</span>,
        loadbalance: <span className={styles.alert}>{loadbalance}</span>,
        cephLocalStorage: (
          <span className={styles.alert}>{cephLocalStorage}</span>
        ),
      },
    );
  }, [data?.getHostPowerControlRelatedSummary, intl]);

  const selectedHostStateMsg = React.useMemo(() => {
    const notInEnteringMaintenanceModeCount =
      selectedList?.filter((item) => item?.state !== HostState.Maintenance)
        ?.length ?? 0;
    return intl.formatMessage(
      {
        id: "host.power.control.state.extra",
        defaultMessage:
          "({notInEnteringMaintenanceModeCount} hosts are not in maintenance mode.)",
      },
      {
        notInEnteringMaintenanceModeCount,
      },
    );
  }, [intl, selectedList]);

  const hasHostNotInEnteringMaintenanceMode = React.useMemo(() => {
    return selectedList?.some((item) => item?.state !== HostState.Maintenance);
  }, [selectedList]);

  return (
    <>
      <DialogWeakP1
        type="warning"
        title={String(modalData?.title ?? "")}
        visible={confirmVisible}
        setVisible={setConfirmisible}
        onConfirm={() => {
          setConfirmisible(false);
          setInnerVisible(true);
        }}
        onCancel={() => {
          setConfirmisible(false);
          setVisible(false);
        }}
        description={modalData?.confirmMessage}
      />
      <DialogForm
        form={dialogForm}
        title={String(modalData?.title ?? "")}
        visible={innerVisible}
        setVisible={setInnerVisible}
        alertType="danger"
        alertMessage={modalData?.alertMessage}
        onOk={onOk}
        onCancel={() => {
          setInnerVisible(false);
          setVisible(false);
        }}
        className={styles.modalFormPower}
        confirmText={okText}
      >
        <Form {...form}>
          <div className={styles.powerControl}>
            <div
              className={cs("zstack-modal-action-select", styles.selectedCount)}
            >
              {intl.formatMessage(
                {
                  id: "selectedCount.x",
                  defaultMessage: "Items: {total}",
                },
                {
                  total: (
                    <span className={styles.textColor}>
                      {selectedList.length}
                    </span>
                  ),
                },
              )}
            </div>
            <div className="zstack-modal-action-resource">
              {selectedList.map((item) => (
                <span className="zstack-modal-action-item" key={item?.uuid}>
                  <Text>{item?.name}</Text>
                </span>
              ))}
            </div>

            {hasHostNotInEnteringMaintenanceMode && (
              <div className={styles.hasHostNotInEnteringMaintenanceMode}>
                <FormField
                  control={form.control}
                  name="enteringMaintenanceMode"
                  render={({ field }) => (
                    <FormItem className={styles.enteringMaintenanceModeItem}>
                      <FormControl>
                        <FormCheckbox
                          checked={Boolean(field.value)}
                          label={modalData?.checkBoxMsg}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={styles.selectedHostStateMsg}>
                  {selectedHostStateMsg}
                </div>
              </div>
            )}
            {isShowStopHost && (
              <>
                <FormField
                  control={form.control}
                  name="stopHost"
                  render={({ field }) => (
                    <FormItem className="zstack-modal-action-formItem">
                      <FormControl>
                        <FormCheckbox
                          checked={Boolean(field.value)}
                          label={intl.formatMessage({
                            id: "power.control.stop.host.checkbox.tip",
                            defaultMessage:
                              "Diable the host services before you power the host off.",
                          })}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Divider className={styles.divider} dashed />
              </>
            )}
            <div className={styles.hTitle}>{linkedResourceMsg}</div>
            <div className="zstack-modal-zsv-action-confirm-danger-action">
              {intl.formatMessage(
                {
                  id: "action.modal.input.confirm.for.danger.action",
                  defaultMessage:
                    "I acknowledge the above risks. To confirm to {actionName}, type {placeholderContent} here.",
                },
                {
                  placeholderContent: <span>{confirmInputText}</span>,
                  actionName,
                },
              )}
            </div>
            <FormField
              control={form.control}
              name="acceptRisk"
              render={({ field }) => (
                <FormItem className="zstack-modal-zsv-action-formItem">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={confirmInputText}
                      className="zstack-modal-zsv-action-confirm-delete-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
    </>
  );
};

export default ZSVBaseAction;
