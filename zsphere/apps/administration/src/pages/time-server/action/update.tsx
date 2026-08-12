import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, Select, ListCollect, Input } from "@zstack/zsphere-components";
import { DialogBase, DialogForm, DialogWeak } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  TimeServerResult,
  UpdateTimeServerPayload,
} from "@zstack/zsphere-types/graphql";
import { isIP, isHostname } from "@zstack/zsphere-utils";
import { useBoolean } from "ahooks";
import { Space } from "antd";
import type { FC } from "react";
import { Fragment, useMemo, useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  primaryStorageList,
  queryTimeServerReachable,
} from "../../../gql/time-server.gql";
import Panel from "../components/panel";
import {
  IModeType,
  useServerMode,
  useServerHostnames,
  useInternalTimeServerCandidates,
} from "../hooks";

import style from "./style.module.less";

const updateTimeServer = gql`
  mutation updateTimeServer($input: UpdateTimeServerInput!) {
    updateTimeServer(input: $input) {
      actionId
    }
  }
`;

const STYLE_MARGIN_TOP_4 = { marginTop: 4 } as const;
const STYLE_WIDTH_240 = { width: 240 } as const;
const STYLE_MARGIN_BOTTOM_0 = { marginBottom: 0 } as const;
const STYLE_WIDTH_320 = { width: 320 } as const;

const UpdateAction: FC<IActionWrapperProps<TimeServerResult>> = ({
  visible,
  setVisible,
  source,
  refetch,
}) => {
  const data = source?.data;
  const [modalFailedVisible, { toggle: setModalFailedVisible }] =
    useBoolean(false);
  const [modalModeVisible, { toggle: setModalModeVisible }] = useBoolean(false);
  const [formValues, setFormValues] = useState<UpdateTimeServerPayload | null>(
    null,
  );
  const [modeType, setModeType] = useState<IModeType>();
  const intl = useIntl();
  const { isRequired, commonValidatorChecker } = useValidator(intl);
  const [form] = Form.useForm();
  const doAction = useAction();
  const { mode, modeList } = useServerMode(data);
  const { internalHostnames, externalHostnames } = useServerHostnames(data);
  const { servers: serverCandidates, loading: serverCandidatesLoading } =
    useInternalTimeServerCandidates();

  const internalServersOptions = useMemo(() => {
    const options = serverCandidates.map(({ hostname, isManagementNode }) => {
      const label = isManagementNode
        ? `${hostname} (${intl.formatMessage({
            id: "management.node",
            defaultMessage: "Management Node",
          })})`
        : hostname;
      return {
        label,
        value: hostname,
      };
    });
    return options;
  }, [intl, serverCandidates]);

  const showInternal = useMemo(() => {
    return (
      modeType &&
      [IModeType.InternalAndExternal, IModeType.OnlyInternal].includes(modeType)
    );
  }, [modeType]);

  const showExternal = useMemo(() => {
    return (
      modeType &&
      [IModeType.InternalAndExternal, IModeType.OnlyExternal].includes(modeType)
    );
  }, [modeType]);
  const { data: primaryStorageData } = useQuery(primaryStorageList, {});
  const cephData = primaryStorageData?.primaryStorageList?.list?.filter(
    (item: { type: string }) => item.type === "Ceph",
  );

  // 根据 cephData 判断是否状态异常
  const isAbnormalState = cephData?.some(
    (item: { state: string; status: string }) => {
      // 状态为 Maintenance(维护模式) 或 Deleting(删除中)
      const stateCondition =
        item.state === "Maintenance" || item.state === "Deleting";
      // 状态为 Connecting(连接中) 或 Disconnected(断开连接)
      const statusCondition =
        item.status === "Connecting" || item.status === "Disconnected";
      return stateCondition || statusCondition;
    },
  );
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const handleSelectChange = useCallback(
    (value: IModeType) => {
      setModeType(value);
    },
    [setModeType],
  );

  const handleOpenModalMode = useCallback(() => {
    setModalModeVisible(true);
  }, [setModalModeVisible]);

  const handleModalModeConfirm = useCallback(() => {
    setModalModeVisible(false);
  }, [setModalModeVisible]);

  const onOk = useCallback(async () => {
    if (isAbnormalState) {
      setModalFailedVisible(true);
      return;
    }
    const values = await form.getFieldsValue();
    setFormValues(values);
    setConfirmInput("");
    setShowRiskAlert(true);
    // setVisible(false)
  }, [form, isAbnormalState, setModalFailedVisible]);

  const handleRiskConfirm = useCallback(() => {
    const payload = formValues;

    if (!payload) {
      setShowRiskAlert(false);
      return;
    }

    doAction({
      mutation: updateTimeServer,
      payload,
      name: intl.formatMessage({
        id: "modify.ntp.action",
        defaultMessage: "Modify NTP Time Server",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
    setShowRiskAlert(false);
    setConfirmInput("");
    setVisible(false);
  }, [doAction, formValues, intl, refetch, setVisible]);

  const beforeValidateModalOpen = useCallback(async () => {
    await form.validateFields();
  }, [form]);
  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setModeType(mode?.value);
      const internal = internalHostnames
        ?.filter((hostname) =>
          serverCandidates.find((server) => server.hostname === hostname),
        )
        ?.slice(0, 2);
      const external = externalHostnames?.length
        ? externalHostnames?.slice(0, 2)
        : [""];
      form.setFieldsValue({
        internal,
        external,
      });
    }
  }, [visible, serverCandidates]);

  const extraContent = useMemo(() => {
    switch (modeType) {
      case IModeType.InternalAndExternal:
        return intl.formatMessage({
          id: "ntp.mode.shared.extra",
          defaultMessage:
            "After the external time server synchronizes with the internal time server, the internal time server then synchronizes time with other nodes on the platform.",
        });
      case IModeType.OnlyExternal:
        return intl.formatMessage({
          id: "ntp.mode.external.extra",
          defaultMessage:
            "Uses an external node as the external time server to synchronize time with all nodes on the platform.",
        });
      default:
        return intl.formatMessage({
          id: "ntp.mode.extra",
          defaultMessage:
            "Uses a management node or host as the time server for the platform system time to synchronize time with other nodes on the platform.",
        });
    }
  }, [modeType, intl]);

  const handleRiskCancel = useCallback(() => {
    setShowRiskAlert(false);
    setConfirmInput("");
    setVisible(true);
  }, [setVisible]);

  return (
    <Fragment>
      <DialogForm
        title={intl.formatMessage({
          id: "modifyConfig",
          defaultMessage: "Modify Configuration",
        })}
        form={form}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item
            label={intl.formatMessage({
              id: "ntp.mode",
              defaultMessage: "NTP Mode",
            })}
            extra={
              <div style={STYLE_MARGIN_TOP_4}>
                {extraContent}
                <Button
                  variant="link"
                  onClick={handleOpenModalMode}
                  className={style.moreInfoBtn}
                >
                  {intl.formatMessage({
                    id: "ntp.mode.learn.more",
                    defaultMessage: "Learn more",
                  })}
                </Button>
              </div>
            }
          >
            <Select
              style={STYLE_WIDTH_240}
              value={modeType}
              onChange={handleSelectChange}
            >
              {modeList.map((mode) => (
                <Select.Option key={mode.value} value={mode.value}>
                  {mode.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {showInternal && (
            <Form.Item
              name="internal"
              label={intl.formatMessage({
                id: "internal.ntp",
                defaultMessage: "Internal Time Server",
              })}
              required
              rules={[isRequired(IIsRequiredType.select)]}
              extra={
                <div style={STYLE_MARGIN_TOP_4}>
                  {intl.formatMessage({
                    id: "ntp.internal.extra",
                    defaultMessage:
                      "Add a maximum of 2 internal time servers. Recommended to use management node as the time server.",
                  })}
                </div>
              }
            >
              <Select
                width="l"
                mode="multiple"
                checkable
                showToggleAll={false}
                showSearch={false}
                virtual={false}
                options={internalServersOptions}
                optionLabelProp="value"
                loading={serverCandidatesLoading}
                limit={2}
              />
            </Form.Item>
          )}
          {showExternal && (
            <Form.Item
              label={intl.formatMessage({
                id: "external.ntp",
                defaultMessage: "External Time Server",
              })}
              required
            >
              <Form.List name="external">
                {(fields, { add, remove }) => (
                  <ListCollect
                    dataSource={fields}
                    add={add}
                    remove={remove}
                    label={`${intl.formatMessage({
                      id: "add.external.ntp",
                      defaultMessage: "Add External Time Server",
                    })}（${fields.length}/2）`}
                    addable={fields.length < 2}
                    removeable={fields.length > 1}
                  >
                    {(field) => (
                      <Form.Item
                        {...field}
                        rules={[
                          isRequired(IIsRequiredType.input),
                          commonValidatorChecker(
                            (value: string) => isIP(value) || isHostname(value),
                            intl.formatMessage({
                              id: "external.ntp",
                              defaultMessage: "External Time Server",
                            }),
                          ),
                          {
                            validator: async (_, value: string) => {
                              const externalValues =
                                form.getFieldValue("external");
                              const duplicateCount = externalValues.filter(
                                (item: string) => item === value,
                              ).length;
                              if (duplicateCount > 1) {
                                throw intl.formatMessage({
                                  id: "external.ntp.duplicate",
                                  defaultMessage: "Duplicated time server. Check again.",
                                });
                              }

                              try {
                                const client = (
                                  window as typeof window & {
                                    g_main?: { apolloClient?: any };
                                  }
                                )?.g_main?.apolloClient;

                                if (!client) {
                                  return Promise.reject(
                                    intl.formatMessage({
                                      id: "external.ntp.unreachable",
                                      defaultMessage:
                                        "Unable to connect with the external time server. Try again.",
                                    }),
                                  );
                                }
                                const res = await client.query({
                                  query: queryTimeServerReachable,
                                  variables: {
                                    internal: form.getFieldValue("internal"),
                                    external: [value],
                                  },
                                });
                                const isValid =
                                  res.data.timeServerReachable.servers.every(
                                    (item: any) => item.reachable,
                                  );
                                if (isValid) {
                                  return;
                                }
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "external.ntp.unreachable",
                                    defaultMessage:
                                      "Unable to connect with the external time server. Try again.",
                                  }),
                                );
                              } catch {
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "external.ntp.unreachable",
                                    defaultMessage:
                                      "Unable to connect with the external time server. Try again.",
                                  }),
                                );
                              }
                            },
                          },
                        ]}
                        style={STYLE_MARGIN_BOTTOM_0}
                      >
                        <Input
                          style={STYLE_WIDTH_320}
                          placeholder={intl.formatMessage({
                            id: "external.ntp.placeholder",
                            defaultMessage: "Time server IP or domain",
                          })}
                        />
                      </Form.Item>
                    )}
                  </ListCollect>
                )}
              </Form.List>
            </Form.Item>
          )}
        </Form>
      </DialogForm>
      <DialogBase
        title={intl.formatMessage({
          id: "ntp.mode.modal.title",
          defaultMessage: "NTP Mode",
        })}
        onOk={handleModalModeConfirm}
        visible={modalModeVisible}
        setVisible={setModalModeVisible}
        hideCancelButton
      >
        <div className={style.modalContent}>
          <Panel
            title={intl.formatMessage({
              id: "ntp.mode.modal.graph",
              defaultMessage: "NTP Mode Diagram",
            })}
          >
            <div className={style.summary}>
              {intl.formatMessage({
                id: "ntp.mode.modal.summary",
                defaultMessage:
                  "The platform supports the following time synchronization modes for NTP servers.",
              })}
            </div>
            <div className={style["internal-summary"]}>
              {intl.formatMessage({
                id: "ntp.mode.modal.internal",
                defaultMessage:
                  "Internal: Uses a management node or host as the time server for the platform system time to synchronize time with other nodes on the platform. You can add a maximum of 2 internal time servers.",
              })}
            </div>
            <Space
              size={10}
              split={<div className={style["mode-arrow"]} />}
              className={style["mode-extra"]}
            >
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="swap-2" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "internal",
                    defaultMessage: "Internal",
                  })}
                </div>
              </div>
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="monitor" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "platform.node",
                    defaultMessage: "Platform Node",
                  })}
                </div>
              </div>
            </Space>
            <div className={style["external-summary"]}>
              {intl.formatMessage({
                id: "ntp.mode.modal.external",
                defaultMessage:
                  "External: Uses an external node as the external time server to synchronize time with all nodes on the platform. You can add a maximum of 2 external time servers.",
              })}
            </div>
            <Space
              size={10}
              split={<div className={style["mode-arrow"]} />}
              className={style["mode-extra"]}
            >
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="external-link" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "external",
                    defaultMessage: "External",
                  })}
                </div>
              </div>
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="monitor" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "platform.node",
                    defaultMessage: "Platform Node",
                  })}
                </div>
              </div>
            </Space>
            <div className={style["shared-summary"]}>
              {intl.formatMessage({
                id: "ntp.mode.modal.shared",
                defaultMessage:
                  "Internal and External: Uses an external node as the external time server and a management node or host as the internal time sever. After the external time server synchronizes with the internal time server, the internal time server then synchronizes time with other nodes on the platform. You can add a maximum of 2 internal time servers and 2 external time servers.",
              })}
            </div>
            <Space
              size={10}
              split={<div className={style["mode-arrow"]} />}
              className={style["mode-extra"]}
            >
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="external-link" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "external",
                    defaultMessage: "External",
                  })}
                </div>
              </div>
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="swap-2" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "internal",
                    defaultMessage: "Internal",
                  })}
                </div>
              </div>
              <div className={style["mode-type"]}>
                <div className={style.icon}>
                  <Icon type="monitor" />
                </div>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "platform.node",
                    defaultMessage: "Platform Node",
                  })}
                </div>
              </div>
            </Space>
          </Panel>
        </div>
      </DialogBase>
      <DialogWeak
        title={intl.formatMessage({
          id: "modify.ntp.source.alert",
          defaultMessage: "Modify NTP Time Server?",
        })}
        type="warning"
        visible={showRiskAlert}
        setVisible={setShowRiskAlert}
        onConfirm={handleRiskConfirm}
        onCancel={handleRiskCancel}
        footer={
          <div className={style.riskConfirmFooter}>
            <Button variant="subtle" onClick={handleRiskCancel}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="danger"
              disabled={confirmInput !== "edit"}
              onClick={handleRiskConfirm}
            >
              {intl.formatMessage({
                id: "confirm.edit",
                defaultMessage: "Confirm to Edit",
              })}
            </Button>
          </div>
        }
        description={
          <div className={style.riskConfirmContent}>
            <ReactMarkdown>
              {intl.formatMessage({
                id: "modify.ntp.modal.action.alert.content",
                defaultMessage:
                  "Modifying the time server may cause cluster time inconsistency, monitoring data deviation or inaccuracy, and may impact ongoing tasks. Proceed with caution.",
              })}
            </ReactMarkdown>
            <div className={style.riskConfirmInstruction}>
              {intl.formatMessage({
                id: "modify.ntp.modal.action.confirm.prefix",
                defaultMessage: "I have confirmed the above information. Enter ",
              })}
              <span className={style.riskConfirmKeyword}>“edit”</span>
              {intl.formatMessage({
                id: "modify.ntp.modal.action.confirm.suffix",
                defaultMessage: " to confirm the modification.",
              })}
            </div>
            <Input
              className={style.riskConfirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              value={confirmInput}
            />
          </div>
        }
      />
      <DialogWeak
        title={intl.formatMessage({
          id: "modify.ntp.modal.fail.config.title",
          defaultMessage: "Cannot Modify Configuration",
        })}
        type="warning"
        visible={modalFailedVisible}
        setVisible={setModalFailedVisible}
        onConfirm={() => setModalFailedVisible(false)}
        description={intl.formatMessage({
          id: "modify.ntp.modal.fail.info",
          defaultMessage:
            "Detected that the distributed storage is in Abnormal status. Make sure that its status turns normal before you make the modification.",
        })}
        footer={
          <Button
            variant="primary"
            onClick={() => setModalFailedVisible(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      />
    </Fragment>
  );
};

export default UpdateAction;
