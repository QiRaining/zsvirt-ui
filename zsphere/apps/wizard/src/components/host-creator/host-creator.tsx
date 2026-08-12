import { gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { ZSVForm } from "@zstack/zsphere-components";
import { Form, Input } from "@zstack/zsphere-components";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import { isIP, isPort } from "@zstack/zsphere-utils";
import type { FC } from "react";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useIntl } from "react-intl";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import type { IWizardFormProps } from "../interface";
import AutoWay from "./auto-way";
import { useInitialValues } from "./hooks/use-initial-values";

const addKvmHost = gql`
  mutation addKvmHost($input: AddKVMHostInput!) {
    addKvmHost(input: $input) {
      actionId
    }
  }
`;

interface IHostCreatorProps extends IWizardFormProps {
  onHostSelectionChange?: (hasSelectedHosts: boolean) => void;
  onHostAddModeChange?: (mode: "manual" | "auto") => void;
}

const { Card } = ZSVForm;

/**
 * 2025-5-15
 * 新增 自动获取 相关逻辑（其实就是从wizardInfo中获取）
 * 1. 自动获取：从wizardInfo中获取hostList，然后批量创建一波
 * 2. 手动添加：手动创建一台
 */

export const HostCreator: FC<IHostCreatorProps> = forwardRef((props, ref) => {
  const { handleTaskFinished, onHostSelectionChange, onHostAddModeChange } =
    props;
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const { commonNameRules, isRequired } = useValidator(intl);

  const { clusterUuid, clusterName } = useWizardStore(
    useShallow((state) => ({
      clusterUuid: state.clusterUuid,
      clusterName: state.clusterName,
    })),
  );
  const wizardInfo = useWizardStore(useShallow((state) => state.wizardInfo));

  const initialValues = useInitialValues(wizardInfo?.hostList);

  // 在组件挂载时通知父组件当前的模式
  useEffect(() => {
    onHostAddModeChange?.(initialValues.hostAddMode as "auto" | "manual");
  }, [initialValues.hostAddMode, onHostAddModeChange]);

  const submit = async () => {
    await form.validateFields();
    form.submit();
  };

  useImperativeHandle(ref, () => ({
    submit,
  }));

  const [selectedHosts, setSelectedHosts] = useState<any[]>([]);

  const handleSelectedHostsChange = useCallback(
    (hosts: any[]) => {
      setSelectedHosts(hosts);
      onHostSelectionChange?.(hosts.length > 0);
    },
    [onHostSelectionChange],
  );

  const handleFinish = (currentValues: any) => {
    const {
      name,
      description,
      managementIp,
      sshPort,
      username,
      password,
      hostAddMode,
    } = currentValues;
    let payload: any[] = [];
    if (hostAddMode === "auto" && selectedHosts.length > 0) {
      payload = selectedHosts.map((host) => ({
        name: host.name,
        description,
        clusterUuid,
        sshPort: host.port,
        username: host.username || "root",
        password: host.password || "",
        managementIp: host.ip,
      }));
    } else {
      payload = [
        {
          name,
          description,
          clusterUuid,
          sshPort,
          username,
          password,
          managementIp,
        },
      ];
    }
    doAction({
      mutation: addKvmHost,
      payload,
      name: intl.formatMessage({ id: "add.host", defaultMessage: "Add Host" }),
      total: payload.length,
      type: "HostVO",
      onFinish: handleTaskFinished,
    });
  };

  return (
    <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
      {wizardInfo?.hostList?.length > 0 && (
        <Card
          title={intl.formatMessage({
            id: "wizard.host.add.mode",
            defaultMessage: "Add Host",
          })}
        >
          <Form.Item
            shouldUpdate={true}
            label={intl.formatMessage({
              id: "wizard.host.add.mode",
              defaultMessage: "Add Host",
            })}
            name="hostAddMode"
          >
            <RadioGroup
              onValueChange={(value) => {
                onHostAddModeChange?.(value as "auto" | "manual");
              }}
              options={[
                {
                  value: "auto",
                  label: intl.formatMessage({
                    id: "wizard.host.add.mode.auto",
                    defaultMessage: "Add Automatically",
                  }),
                },
                {
                  value: "manual",
                  label: intl.formatMessage({
                    id: "wizard.host.add.mode.manual",
                    defaultMessage: "Add Manually",
                  }),
                },
              ]}
            />
          </Form.Item>
        </Card>
      )}
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.hostAddMode !== cur.hostAddMode}
      >
        {({ getFieldValue }) => {
          const hostAddMode = getFieldValue("hostAddMode");

          return hostAddMode === "auto" ? (
            <AutoWay onSelectedHostsChange={handleSelectedHostsChange} />
          ) : (
            <>
              <Card
                title={intl.formatMessage({
                  id: "basic.info",
                  defaultMessage: "Basic Info",
                })}
              >
                <Form.Item
                  shouldUpdate={true}
                  label={intl.formatMessage({
                    id: "name",
                    defaultMessage: "Name",
                  })}
                  name="name"
                  rules={commonNameRules}
                >
                  <Input className="width-320" />
                </Form.Item>
                <Form.Item
                  name="clusterUuid"
                  label={intl.formatMessage({
                    id: "cluster",
                    defaultMessage: "Cluster",
                  })}
                >
                  {clusterName}
                </Form.Item>
              </Card>
              <Card
                title={intl.formatMessage({
                  id: "host.info",
                  defaultMessage: "Host Info",
                })}
              >
                <Form.Item
                  name="managementIp"
                  label={intl.formatMessage({
                    id: "ipAdress",
                    defaultMessage: "IP Address",
                  })}
                  tooltip={intl.formatMessage(
                    {
                      id: "host.field.hostIp.hover",
                      defaultMessage: "Sample: {ip}",
                    },
                    {
                      ip: "192.168.0.100",
                    },
                  )}
                  rules={[
                    isRequired(),
                    () => ({
                      validator(rule, values) {
                        if (!values || isIP(values)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "host.field.hostIp.validator.format",
                              defaultMessage: "Invalid IP address.",
                            }),
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <Input className="width-320" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: "sshPort",
                    defaultMessage: "SSH Port",
                  })}
                  name="sshPort"
                  rules={[
                    isRequired(),
                    () => ({
                      validator(rule, values) {
                        if (values === "" || isPort(values)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "host.field.sshPort.validator.format",
                              defaultMessage: "Invalid SSH port.",
                            }),
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <Input className="width-80" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: "ssh.username",
                    defaultMessage: "SSH Username",
                  })}
                  name="username"
                  rules={[isRequired()]}
                >
                  <Input className="width-320" />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: "ssh.password",
                    defaultMessage: "SSH Password",
                  })}
                  name="password"
                  rules={[isRequired()]}
                >
                  <Input.Password className="width-320" />
                </Form.Item>
              </Card>
            </>
          );
        }}
      </Form.Item>
    </Form>
  );
});
