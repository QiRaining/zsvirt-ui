import { RadioGroup } from "@zstack/design";
import { ZSVForm } from "@zstack/zsphere-components";
import { Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ipToInt, isIP, isPort } from "@zstack/zsphere-utils";
import { Space } from "antd";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;

const HostConfig: FC = () => {
  const intl = useIntl();
  const [addMode, setAddMode] = useState("single");
  const { isRequired } = useValidator(intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "host.info",
        defaultMessage: "Host Info",
      })}
    >
      <Item
        label={intl.formatMessage({
          id: "addMode",
          defaultMessage: "Addition Method",
        })}
        name="addMode"
        required
      >
        <RadioGroup
          onValueChange={(val) => setAddMode(val)}
          options={[
            {
              value: "single",
              label: intl.formatMessage({
                id: "single",
                defaultMessage: "Single",
              }),
            },
            {
              value: "batch",
              label: intl.formatMessage({
                id: "batch",
                defaultMessage: "Batch",
              }),
            },
          ]}
        />
      </Item>

      {addMode === "batch" ? (
        <Item
          label={intl.formatMessage({
            id: "ipRange",
            defaultMessage: "IP Range",
          })}
          required={true}
          className={style["ip-range"]}
        >
          <Space size={8} split="-" align="center">
            <Item
              name="startIp"
              tooltip={intl.formatMessage(
                {
                  id: "host.field.startIp.hover",
                  defaultMessage: "Sample: {ip}",
                },
                {
                  ip: "192.168.0.100",
                },
              )}
              dependencies={["endIp"]}
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
                          id: "host.field.startIp.validator.format",
                          defaultMessage: "Invalid IP address.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
              noStyle
            >
              <Input className="width-160" />
            </Item>
            <Item
              name="endIp"
              tooltip={intl.formatMessage(
                {
                  id: "host.field.endIp.hover",
                  defaultMessage: "Sample: {ip}",
                },
                {
                  ip: "192.168.0.255",
                },
              )}
              dependencies={["startIp"]}
              rules={[
                isRequired(),
                ({ getFieldValue: _getFieldValue }) => ({
                  validator(rule, values) {
                    if (!values || isIP(values)) {
                      const _startIp = _getFieldValue("startIp");
                      if (isIP(_startIp)) {
                        if (
                          Math.abs(ipToInt(values) - ipToInt(_startIp)) >= 500
                        ) {
                          return Promise.reject(
                            Error(
                              intl.formatMessage({
                                id: "host.field.endIp.validator.rangeSize",
                                defaultMessage: "Up to 500 hosts allowed at one time.",
                              }),
                            ),
                          );
                        }
                      }
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "host.field.endIp.validator.format",
                          defaultMessage: "Invalid IP address.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
              noStyle
            >
              <Input className="width-160" />
            </Item>
          </Space>
        </Item>
      ) : (
        <Item
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
          <Input className={style["width-400"]} />
        </Item>
      )}

      <Item
        label={intl.formatMessage({ id: "sshPort", defaultMessage: "SSH Port" })}
        name="sshPort"
        normalize={(value) => {
          if (!value) {
            return value;
          }
          const result = Number(value);
          if (Number.isNaN(result)) {
            return value;
          }
          return result;
        }}
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
        <Input className={style["width-160"]} />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "ssh.username",
          defaultMessage: "SSH Username",
        })}
        name="username"
        rules={[isRequired()]}
      >
        <Input className={style["width-400"]} />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "ssh.password",
          defaultMessage: "SSH Password",
        })}
        name="password"
        rules={[isRequired()]}
      >
        <Input.Password className={style["width-400"]} />
      </Item>
    </Card>
  );
};

export default HostConfig;
