import { gql } from "@apollo/client";
import RestartConfirmModal from "@zstack/virtualization-resource/src/pages/vm/components/restart-confirm-modal";
import {
  useCommonPaswordValidator,
  useGlobalConfigPaswordValidator,
  useQueryGlobalConfigPasword,
} from "@zstack/virtualization-resource/src/pages/vm/utils";
import type { ListItem } from "@zstack/zsphere-components";
import { Switch } from "@zstack/zsphere-components";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { isEqual, compact } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useResourceConfigQuery } from "../../hooks/use-resource-config-query";
import { vmConsoleModeMap } from "../../utils";

const editVmRemoteConfig = gql`
  mutation editVmRemoteConfig($input: EditRemoteConfigInput!) {
    editVmRemoteConfig(input: $input) {
      actionId
    }
  }
`;

const EditOtherConfig: React.FC<{
  form: any;
  hostUuid: string;
  visible: boolean;
  platform: string;
}> = ({ platform }) => {
  const intl = useIntl();
  const { consolePassword } = useQueryGlobalConfigPasword();
  const isWindow = platform
    ? ["Windows", "WindowsVirtio"].includes(platform)
    : false;
  const { validator: globalValidator } = useGlobalConfigPaswordValidator({
    isWindow,
    passwordGlobalConfig: consolePassword!,
  });
  const { validator } = useCommonPaswordValidator();

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "consoleMode",
          defaultMessage: "Console Mode",
        })}
        labelWidth={160}
        name="consoleMode"
        icon="info"
        required
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.field.consoleMode.tooltip",
              defaultMessage: `### Console Mode

Used to independently configure VM console mode, including VNC, SPICE, and VNC+SPICE.

Note that after a console mode is configured for the existing virtual machines, rebboot these virtual machines to take effect.`,
            })}
          </ReactMarkdown>
        }
      >
        <Select width="s">
          <Select.Option value="vnc">vnc</Select.Option>
          <Select.Option value="spice">spice</Select.Option>
          <Select.Option value="vncAndSpice">vnc + spice</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.consoleMode !== cur.consoleMode}
      >
        {({ getFieldValue }) =>
          getFieldValue("consoleMode") === "vnc" ? null : (
            <>
              <Form.Item
                name="vdiMonitorNumber"
                label={intl.formatMessage({
                  id: "virtualization.vdiMonitorNumber",
                  defaultMessage: "VDI Screen Count",
                })}
              >
                <InputNumber />
              </Form.Item>
              <Form.Item name="spiceStreamingMode" label="Spice Streaming">
                <Select width="s">
                  <Select.Option value="off">off</Select.Option>
                  <Select.Option value="filter">filter</Select.Option>
                  <Select.Option value="all">all</Select.Option>
                </Select>
              </Form.Item>
            </>
          )
        }
      </Form.Item>
      <Form.Item
        name="usbRedirect"
        label={intl.formatMessage({
          id: "spice.usbRedirect",
          defaultMessage: "USB Redirection",
        })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        name="changeConsolePassword"
        label={intl.formatMessage({
          id: "change.vnc.password",
          defaultMessage: "Change Console Password",
        })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(cur, prev) =>
          prev.changeConsolePassword !== cur.changeConsolePassword
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("changeConsolePassword") ? (
            <>
              <Form.Item
                validateFirst
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "vm.field.consolePassword.validator.required",
                      defaultMessage: "Enter a console password.",
                    }),
                  },
                  {
                    async validator(rule, value) {
                      const length = value?.length;

                      if (!consolePassword?.enabled) {
                        if (!length) {
                          return;
                        }

                        if (length < 6 || length > 8) {
                          throw intl.formatMessage(
                            {
                              id: "vm.field.consolePassword.validator.range",
                              defaultMessage:
                                "The console password must be {min}–{max} characters in length.",
                            },
                            {
                              min: 6,
                              max: 8,
                            },
                          );
                        }

                        return;
                      }

                      return globalValidator(value);
                    },
                  },
                  {
                    validator(rule, value: string) {
                      return validator(value);
                    },
                  },
                ]}
                name="newPassword"
                label={intl.formatMessage({
                  id: "newPassword",
                  defaultMessage: "New Password",
                })}
                description={intl.formatMessage({
                  id: "vm.modal.modify.consolePassword.description",
                  defaultMessage: "Enter letters, digits, and special characters. Supported special characters include -`=[];',./~!@#$%^&*()_+|{}:\"<>?",
                })}
              >
                <Input type="password" className="width-320" />
              </Form.Item>
              <Form.Item
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "vm.field.consolePassword.validator.required",
                      defaultMessage: "Enter a console password.",
                    }),
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: "vm.field.password.validator.inconsistent",
                            defaultMessage: "The passwords do not match.",
                          }),
                        ),
                      );
                    },
                  }),
                ]}
                name="repeatPassword"
                label={intl.formatMessage({
                  id: "vm.field.password.validator.confirm",
                  defaultMessage: "Confirm Password",
                })}
                style={{ marginTop: -8 }}
              >
                <Input type="password" className="width-320" />
              </Form.Item>
            </>
          ) : null
        }
      </Form.Item>
    </>
  );
};

const Action: React.FC<IActionWrapperProps<IVM> & { resourceConfig?: any }> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();

  const vm = selectedList?.[0];
  const [initialValues, setInitialValues] = useState<{ [prop: string]: any }>(
    {},
  );
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmList, _setConfirmList] = useState<ListItem[]>([]);
  const [resourceConfig] = useResourceConfigQuery(
    vm?.uuid,
    ["vm", "kvm", "pciDevice"],
    ["spiceStreamingMode"],
    visible,
  );

  useEffect(() => {
    if (visible && vm && resourceConfig) {
      const value = {
        consoleMode: vmConsoleModeMap(
          vm?.systemTag?.vmConsoleMode as string,
          vm?.consoleAddress,
        ),
        vdiMonitorNumber: vm?.systemTag?.VDIMonitorNumber || 1,
        spiceStreamingMode: resourceConfig?.spiceStreamingMode?.value || "off",
        usbRedirect: vm?.systemTag?.usbRedirect,
        changeConsolePassword: false,
      };
      setInitialValues(value);
      form.setFieldsValue(value);
    }
  }, [visible, vm, resourceConfig]);

  const onOk = async (values: any) => {
    const _payload: any = {};
    const _list: ListItem[] = [];
    if (!isEqual(values.consoleMode, initialValues.consoleMode)) {
      _payload.setVmConsoleModePayload = {
        uuid: vm?.uuid,
        mode: values.consoleMode,
      };
      _list.push({
        label: intl.formatMessage({
          id: "console.mode",
          defaultMessage: "Console Mode",
        }),
      });
    }

    if (values.consoleMode !== "vnc") {
      if (!isEqual(values.vdiMonitorNumber, initialValues.vdiMonitorNumber)) {
        _payload.setVmMonitorNumberPayload = {
          uuid: vm?.uuid,
          monitorNumber: values.vdiMonitorNumber,
        };
        _list.push({
          label: intl.formatMessage({
            id: "virtualization.vdiMonitorNumber",
            defaultMessage: "VDI Screen Count",
          }),
        });
      }
      if (
        !isEqual(values.spiceStreamingMode, initialValues.spiceStreamingMode)
      ) {
        _payload.updateResourceConfigPayload = {
          category: "vm",
          name: "spiceStreamingMode",
          resourceUuid: vm?.uuid,
          value: values.spiceStreamingMode,
        };
        _list.push({ label: "Spice Streaming" });
      }
    }

    if (!isEqual(values.usbRedirect, initialValues.usbRedirect)) {
      _payload.setVmUsbRedirectPayload = {
        uuid: vm?.uuid,
        enable: values.usbRedirect,
      };
      _list.push({
        label: intl.formatMessage({
          id: "usbRedirect",
          defaultMessage: "USB Redirection",
        }),
      });
    }

    if (values.changeConsolePassword) {
      _payload.setVmConsolePasswordPayload = {
        uuid: vm?.uuid,
        consolePassword: values.newPassword,
      };
      _list.push({
        label: intl.formatMessage({
          id: "console.password",
          defaultMessage: "Console Password",
        }),
      });
    }
    if (vm?.systemTag?.consolePassword && !values.changeConsolePassword) {
      _payload.deleteVmConsolePasswordPayload = {
        uuid: vm?.uuid,
      };
      _list.push({
        label: intl.formatMessage({
          id: "delete.vmConsolePassword",
          defaultMessage: "Cancel VM Console Password",
        }),
      });
    }
    if (compact(Object.values(_payload))?.length === 0) {
      // setConfirmVisible(false)
    } else {
      // setConfirmList(_list)
      // setConfirmVisible(true)
      requestAction(_payload);
    }
  };

  const requestAction = (_payload: any) => {
    doAction({
      mutation: editVmRemoteConfig,
      payload: _payload,
      name: intl.formatMessage({
        id: "edit.remote.console.config",
        defaultMessage: "Modify Remote Access",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
      },
    });
    setConfirmVisible(false);
  };

  return (
    <>
      <DialogForm
        visible={visible}
        setVisible={setVisible}
        onCancel={() => setVisible(false)}
        title={intl.formatMessage({
          id: "edit.remote.console.config",
          defaultMessage: "Modify Remote Access",
        })}
        form={form}
        onOk={onOk}
        resourceName={formatResourceName(selectedList, intl)}
      >
        <Form form={form}>
          <EditOtherConfig
            hostUuid={selectedList?.[0]?.hostUuid ?? -1}
            visible={visible}
            form={form}
            platform={selectedList?.[0]?.platform ?? -1}
          />
        </Form>
      </DialogForm>
      <RestartConfirmModal
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        list={confirmList}
        configNumber={confirmList?.length}
        onOk={requestAction}
      />
    </>
  );
};

export default Action;
