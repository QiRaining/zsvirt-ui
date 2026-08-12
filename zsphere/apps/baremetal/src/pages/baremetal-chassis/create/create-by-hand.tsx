import { gql, useQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import { ZSVForm } from "@zstack/zsphere-components";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  TextArea,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { BaremetalChassis } from "@zstack/zsphere-types/graphql";
import { isIP, isUint } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createBaremetalChassis,
  inspectBaremetalChassis,
} from "../../../gql/baremetal-chassis.gql";
import { intToIp, ipToInt } from "../utils";

import style from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

export const initialValues = {
  type: "ip",
  ipmiPort: 623,
  restartAfterAdding: false,
};

const { Card } = ZSVForm;
const { Item } = Form;

const startIpItemStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 0,
};
const ipRangeSeparatorStyle: React.CSSProperties = {
  display: "inline-block",
  width: "24px",
  lineHeight: "32px",
  textAlign: "center",
};
const endIpItemStyle: React.CSSProperties = { display: "inline-block" };

const QUERY_BAREMETAL_CLUSTER_LIST = gql`
  query queryClusterList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    clusterList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
      }
    }
  }
`;

const transformManualAddData = ({
  type = "",
  data = {},
}: {
  type: string;
  data: any;
}) => {
  const newData = _.cloneDeep(data);

  _.unset(newData, "type");

  if (type === "ip") {
    return [
      {
        ...newData,
      },
    ];
  }

  const startIpmiAddress = _.get(newData, "startIpmiAddress");
  const endIpmiAddress = _.get(newData, "endIpmiAddress");

  const startIPInt = ipToInt(startIpmiAddress);
  const endIPInt = ipToInt(endIpmiAddress);

  const count = endIPInt - startIPInt;
  const baseName = _.replace(_.get(newData, "name", ""), /-\d+$/, "");

  const rest = _.omit(newData, ["startIpmiAddress", "endIpmiAddress"]);

  return _.times(count + 1, (i) => ({
    ...rest,
    name: `${baseName}-${i}`,
    ipmiAddress: intToIp(startIPInt + i),
  }));
};

const Action: React.FC<IActionWrapperProps<BaremetalChassis>> = ({
  visible,
  setVisible,
  selectedList: _selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);

  const onOk = async (values: any) => {
    try {
      const payload = transformManualAddData({
        type: values?.type,
        data: values,
      });

      const restartAfterAddingUuids: string[] = [];

      doAction({
        mutation: createBaremetalChassis,
        payload,
        name: intl.formatMessage({
          id: "add.baremetalChassis",
          defaultMessage: "Add Bare Metal Chassis",
        }),
        total: payload.length,
        type: "BaremetalChassis",
        forceRunCallback: true,
        onProgress(result) {
          const uuid = result?.inventory?.uuid;

          if (!uuid || !values?.restartAfterAdding) {
            return;
          }

          restartAfterAddingUuids.push(uuid);
        },
        onFinish() {
          const total = restartAfterAddingUuids.length;

          if (!total) {
            return;
          }

          const restartAfterAddingPayload = restartAfterAddingUuids.map(
            (item) => ({
              uuid: item,
            }),
          );

          doAction({
            mutation: inspectBaremetalChassis,
            payload: restartAfterAddingPayload,
            name: intl.formatMessage({
              id: "provision.baremetalChassis",
              defaultMessage: "Deploy Bare Metal Chassis",
            }),
            total,
            type: "BaremetalChassis",
          });
        },
      });
    } catch (err) {
      console.error(err);
    }
    setVisible(false);
  };

  const clusterDefaultQuery = useMemo(() => {
    return {
      conditions: [
        { key: "hypervisorType", op: Op.eq, value: "baremetal" },
        { key: "state", op: Op.eq, value: "Enabled" },
      ],
    };
  }, []);

  const { data } = useQuery(QUERY_BAREMETAL_CLUSTER_LIST, {
    variables: {
      ...clusterDefaultQuery,
    },
    fetchPolicy: "no-cache",
  });

  const clusterListMemo = useMemo(() => {
    return data?.clusterList?.list?.map((it: any) => {
      return {
        label: it.name,
        value: it.uuid,
      };
    });
  }, [data]);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "baremetalChassis.modal.title.add",
        defaultMessage: "Add Bare Metal Chassis",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form} initialValues={initialValues}>
        <Card
          title={intl.formatMessage({
            id: "basic.info",
            defaultMessage: "Basic Info",
          })}
        >
          <Item
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            tooltip={intl.formatMessage({
              id: "global.field.name.hover",
              defaultMessage:
                "Names must be 1-128 characters in length and can contain Chinese characters, letters, digits, hyphens (\"-\"), underscores (\"_\"), periods (\".\"), parenthesis (\"()\"), colons (\":\"), and plus signs (\"+\").",
            })}
            name="name"
            rules={commonNameRules}
          >
            <Input className="width-320" />
          </Item>

          <Item
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            name="description"
            rules={commonDescriptionRules}
          >
            <TextArea
              rows={4}
              className="width-320"
              maxLength={256}
              isShowLimit
            />
          </Item>

          <Item
            label={intl.formatMessage({
              id: "baremetalCluster",
              defaultMessage: "Bare Metal Cluster",
            })}
            name="clusterUuid"
            required
            rules={[isRequired(IIsRequiredType.select)]}
          >
            <Select options={clusterListMemo} className="width-320" />
          </Item>
        </Card>

        <Card
          title={intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
          className={style.configCard}
        >
          <Item
            label={intl.formatMessage({
              id: "add.method",
              defaultMessage: "Addition Method",
            })}
            name="type"
          >
            <RadioGroup
              options={[
                {
                  value: "ip",
                  label: intl.formatMessage({
                    id: "ipmiAddress",
                    defaultMessage: "IPMI Address",
                  }),
                },
                {
                  value: "range",
                  label: intl.formatMessage({
                    id: "ipmiAddressRange",
                    defaultMessage: "IPMI Range",
                  }),
                },
              ]}
            />
          </Item>

          <Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => {
              return (
                <>
                  {getFieldValue("type") === "ip" ? (
                    <Item
                      label={intl.formatMessage({
                        id: "ipmi.address",
                        defaultMessage: "IPMI Address",
                      })}
                      tooltip={intl.formatMessage({
                        id: "bareMetalNode.field.ipmi.address.tooltip",
                        defaultMessage: "Example: 192.168.0.1",
                      })}
                      name="ipmiAddress"
                      rules={[
                        {
                          required: true,
                          validator(rule, value: string) {
                            if (!value) {
                              return Promise.reject(
                                Error(
                                  intl.formatMessage({
                                    id: "bareMetalNode.field.management.ip.validator.required",
                                    defaultMessage: "This filed is required.",
                                  }),
                                ),
                              );
                            }
                            if (value && !isIP(value)) {
                              return Promise.reject(
                                Error(
                                  intl.formatMessage({
                                    id: "bareMetalNode.field.start.ip.validator.format",
                                    defaultMessage: "Invalid IP address.",
                                  }),
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      preserve={false}
                    >
                      <Input className="width-320" />
                    </Item>
                  ) : null}
                  {getFieldValue("type") === "range" ? (
                    <Item
                      label={intl.formatMessage({
                        id: "ipmi.address.range",
                        defaultMessage: "IPMI Range",
                      })}
                      required
                    >
                      <Item
                        name="startIpmiAddress"
                        style={startIpItemStyle}
                        rules={[
                          {
                            validator(rule, values) {
                              if (!values) {
                                return Promise.reject(
                                  Error(
                                    intl.formatMessage({
                                      id: "bareMetalNode.field.start.ip.validator.required",
                                      defaultMessage: "Enter an IPMI end address.",
                                    }),
                                  ),
                                );
                              }
                              if (values && !isIP(values)) {
                                return Promise.reject(
                                  Error(
                                    intl.formatMessage({
                                      id: "bareMetalNode.field.start.ip.validator.format",
                                      defaultMessage: "Invalid IP address.",
                                    }),
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        tooltip={intl.formatMessage({
                          id: "bareMetalNode.field.ipmi.address.start.ip.tooltip",
                          defaultMessage: "Example: 192.168.0.100",
                        })}
                        preserve={false}
                      >
                        <Input className="width-160" />
                      </Item>
                      <span style={ipRangeSeparatorStyle}>-</span>
                      <Item
                        name="endIpmiAddress"
                        dependencies={["startIpmiAddress"]}
                        style={endIpItemStyle}
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            message: intl.formatMessage({
                              id: "bareMetalNode.field.ipmi.end.address.validator.required",
                              defaultMessage: "Enter an IPMI end address.",
                            }),
                          },
                          {
                            async validator(rule, values) {
                              if (!values) {
                                return;
                              }

                              if (!isIP(values)) {
                                throw Error(
                                  intl.formatMessage({
                                    id: "bareMetalNode.field.end.ipmi.address.validator.format",
                                    defaultMessage: "Incorrect IPMI address format",
                                  }),
                                );
                              }

                              const startIpmiAddress = (
                                getFieldValue("startIpmiAddress") ?? ""
                              ).trim();

                              if (!startIpmiAddress) {
                                return;
                              }

                              const count =
                                ipToInt(values) - ipToInt(startIpmiAddress);

                              if (count < 0) {
                                throw Error(
                                  intl.formatMessage({
                                    id: "bareMetalNode.field.end.ipmi.address.validator.range",
                                    defaultMessage: "Invalid IP range",
                                  }),
                                );
                              }

                              if (count > 500) {
                                throw Error(
                                  intl.formatMessage({
                                    id: "bareMetalNode.field.end.ipmi.address.validator.count",
                                    defaultMessage: "The IP count must not exceed 500.",
                                  }),
                                );
                              }
                            },
                          },
                        ]}
                        tooltip={intl.formatMessage({
                          id: "bareMetalNode.field.ipmi.address.end.ip.tooltip",
                          defaultMessage: "Example: 192.168.0.255",
                        })}
                        preserve={false}
                      >
                        <Input className="width-160" />
                      </Item>
                    </Item>
                  ) : null}
                </>
              );
            }}
          </Item>

          <Item
            label={intl.formatMessage({ id: "port", defaultMessage: "Port" })}
            name="ipmiPort"
            validateFirst
            required
            rules={[
              () => ({
                async validator(rule, values = "") {
                  const newValues = `${values}`.trim();

                  if (!newValues) {
                    throw Error(
                      intl.formatMessage({
                        id: "baremetalChassis.field.ipmiPort.validator.required",
                        defaultMessage: "Enter an IPMI port.",
                      }),
                    );
                  }

                  if (!isUint(newValues)) {
                    throw Error(
                      intl.formatMessage({
                        id: "baremetalChassis.field.ipmiPort.validator.format",
                        defaultMessage: "Error IPMI port format",
                      }),
                    );
                  }
                },
              }),
            ]}
          >
            <InputNumber
              showOperationBtn={false}
              max={9007199254740991}
              className="width-80"
            />
          </Item>

          <Item
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            name="ipmiUsername"
            validateFirst
            rules={[isRequired()]}
          >
            <Input className="width-320" />
          </Item>

          <Item
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            name="ipmiPassword"
            rules={[isRequired()]}
          >
            <Input.Password className="width-320" />
          </Item>

          <Item
            name="restartAfterAdding"
            label={intl.formatMessage({
              id: "restart.baremetalChassis",
              defaultMessage: "Reboot Bare Metal Chassis",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "baremetalChassis.field.restart.baremetalChassis.tooltip",
                  defaultMessage: `### Reboot Bare Metal Chassis

1. Selecting this checkbox to reboot the bare metal chassis and automatically collect hardware information.
2. Unselected by default. You need to manually reboot the bare metal chassis to collect hardware information.`,
                })}
              </ReactMarkdown>
            }
            valuePropName="checked"
            textFormItem
          >
            <FormCheckbox
              label={intl.formatMessage({
                id: "baremetalChassis.field.restart.baremetalChassis.checkbox.content",
                defaultMessage: "Reboot bare metal chassis to obtain hardware information",
              })}
            />
          </Item>
        </Card>
      </Form>
    </DialogForm>
  );
};

export default Action;
