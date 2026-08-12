import { gql, useMutation } from "@apollo/client";
import { CheckboxGroup } from "@zstack/design";
import { Text } from "@zstack/design";
import { checkIpAvailability } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { KernelTrafficTypes } from "@zstack/zsphere-types";
import type {
  HostKernelInterface,
  MutationcheckIpAvailabilityArgs as CheckIpAvailabilityArgs,
  CheckIpAvailabilityResult,
} from "@zstack/zsphere-types/graphql";
import { calculateCIDRRange, ipToInt } from "@zstack/zsphere-utils";
import React, { useMemo, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import IpInput from "../../vm/create/hardware-and-config/hardware/netcard/components/ip-input";
import { useKernelTrafficTypesMap } from "../hooks";

import style from "./style.module.less";

interface CheckIpAvailabilityResp {
  checkIpAvailability?: CheckIpAvailabilityResult;
}

const updateHostKernelInterface = gql`
  mutation updateHostKernelInterface($input: UpdateHostKernelInterfaceInput!) {
    updateHostKernelInterface(input: $input) {
      actionId
    }
  }
`;

const EditConfig: React.FC<IActionWrapperProps<HostKernelInterface>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { isRequired, ipValidator, netmaskValidator } = useValidator(intl);
  const { kernelTrafficTypesMap, kernelTrafficTypesList } =
    useKernelTrafficTypesMap();
  const [remoteValidateIp] = useMutation<
    CheckIpAvailabilityResp,
    CheckIpAvailabilityArgs
  >(checkIpAvailability);

  const current = selectedList?.[0] ?? {};
  const title = intl.formatMessage({
    id: "zskernel.edit.config",
    defaultMessage: "Modify Configuration",
  });

  const ipRanges =
    current.l3Network?.ipRanges?.filter(
      (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
    ) ?? [];
  const { networkCidr, gateway } = ipRanges[0] ?? {};

  const invalidAddresses: string[] = [];
  if (gateway) {
    invalidAddresses.push(gateway);
  }
  if (networkCidr) {
    const { networkAddress, broadcastAddress } =
      calculateCIDRRange(networkCidr);
    invalidAddresses.push(networkAddress, broadcastAddress);
  }

  const initialValues = useMemo(
    () =>
      current.isDefault
        ? {
            name: current?.name,
            description: current?.description,
            trafficTypes: current?.trafficTypes,
          }
        : {
            name: current?.name,
            description: current?.description,
            requiredIp: current?.usedIps?.[0]?.ip,
            netmask: current.usedIps?.[0]?.netmask,
          },
    [current],
  );

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [form, visible, initialValues]);

  const submitHandle = useCallback(
    (data) => {
      const payload: any = {
        uuid: current.uuid,
        name: data.name,
        description: data.description,
      };

      if (current.isDefault && data.trafficTypes) {
        const currentTrafficTypes = initialValues.trafficTypes || [];
        const newTrafficTypes = data.trafficTypes || [];
        const isTrafficTypesChanged =
          JSON.stringify([...currentTrafficTypes].sort()) !==
          JSON.stringify([...newTrafficTypes].sort());
        if (isTrafficTypesChanged) {
          payload.trafficTypes = data.trafficTypes;
        }
      }

      if (!current.isDefault) {
        const requiredIpChanged = data.requiredIp !== initialValues.requiredIp;
        const netmaskChanged = data.netmask !== initialValues.netmask;

        if (requiredIpChanged || netmaskChanged) {
          payload.requiredIp = data.requiredIp;
          payload.netmask = data.netmask;
        }
      }

      doAction({
        mutation: updateHostKernelInterface,
        payload,
        name: title,
        total: 1,
        type: "HostKernelInterface",
        onFinish() {
          refetch?.();
        },
      });
    },
    [doAction, current, title, refetch, initialValues],
  );

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      form={form}
      title={title}
      onOk={submitHandle}
      resourceName={selectedList?.[0]?.name}
    >
      <Form form={form}>
        <ZSVForm.NameAndDesc />
        {current.isDefault ? (
          <Form.Item
            label={intl.formatMessage({
              id: "hostKernelInterface.field.network.trafficTypes",
              defaultMessage: "Network Service",
            })}
            name="trafficTypes"
          >
            <CheckboxGroup
              items={kernelTrafficTypesList.map((item) => ({
                label: <Text>{item.label}</Text>,
                value: item.key,
                disabled: item?.key === KernelTrafficTypes.Management,
              }))}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label={intl.formatMessage({
              id: "hostKernelInterface.field.network.trafficTypes",
              defaultMessage: "Network Service",
            })}
          >
            {current.trafficTypes?.length ? (
              <Text>
                {current.trafficTypes
                  .map((item) => kernelTrafficTypesMap.get(item) ?? item)
                  .join("、")}
              </Text>
            ) : (
              <span className={style.emptyText}>
                {intl.formatMessage({ id: "empty", defaultMessage: "Empty" })}
              </span>
            )}
          </Form.Item>
        )}

        <Form.Item
          label={intl.formatMessage({
            id: "zskernel.l3network",
            defaultMessage: "Distributed Port Group",
          })}
        >
          <Text className={style.l3networkField}>
            {current.l3Network?.name ?? "-"}
          </Text>
        </Form.Item>

        {current.isDefault ? (
          <>
            <Form.Item
              label={intl.formatMessage({
                id: "zskernel.ipv4.address",
                defaultMessage: "IPv4 Address",
              })}
            >
              <Text>{current.usedIps?.[0]?.ip ?? "-"}</Text>
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: "zskernel.netmask",
                defaultMessage: "Netmask",
              })}
            >
              <Text>{current.usedIps?.[0]?.netmask ?? "-"}</Text>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label={intl.formatMessage({
                id: "zskernel.ipv4.address",
                defaultMessage: "IPv4 Address",
              })}
              name="requiredIp"
              validateTrigger="onBlur"
              required
              rules={[
                isRequired(),
                ipValidator(),
                () => ({
                  validator: async (rule: any, value) => {
                    if (!value) {
                      return;
                    }

                    if (invalidAddresses.includes(value)) {
                      throw new Error(
                        intl.formatMessage({
                          id: "hostKernelInterface.field.requiredIp.validator.gateway.message",
                          defaultMessage:
                            "The IP address cannot be a network address, gateway address, or broadcast address.",
                        }),
                      );
                    }

                    const valueInt = ipToInt(value);
                    const isInIpRanges =
                      ipRanges.length === 0 ||
                      ipRanges.some(({ startIp, endIp }) => {
                        const startIpInt = ipToInt(startIp!);
                        const endIpInt = ipToInt(endIp!);
                        return valueInt >= startIpInt && valueInt <= endIpInt;
                      });
                    if (!isInIpRanges) {
                      throw new Error(
                        intl.formatMessage({
                          id: "hostKernelInterface.field.requiredIp.validator.cidr.message",
                          defaultMessage: "The IP address must be within the IP range of a distributed port group. Please re-enter.",
                        }),
                      );
                    }

                    if (
                      value !== current.usedIps?.[0]?.ip &&
                      current.l3Network?.uuid
                    ) {
                      const { data } = await remoteValidateIp({
                        variables: {
                          input: {
                            l3NetworkUuid: current.l3Network.uuid,
                            ip: value,
                          },
                        },
                      });
                      const available =
                        data?.checkIpAvailability?.available ?? true;
                      if (!available) {
                        throw new Error(
                          intl.formatMessage({
                            id: "hostKernelInterface.field.requiredIp.validator.occupied",
                            defaultMessage: "The IP address is already occupied. Please re-input.",
                          }),
                        );
                      }
                    }
                  },
                }),
              ]}
            >
              {current?.l3Network?.enableIPAM ? (
                <IpInput
                  l3NetworkUuid={current?.l3Network?.uuid}
                  ipVersion={4}
                  className={style["ip-input"]}
                />
              ) : (
                <Input className="width-320" />
              )}
            </Form.Item>

            <Form.Item
              label={intl.formatMessage({
                id: "netmask",
                defaultMessage: "Netmask",
              })}
              name="netmask"
              validateTrigger="onBlur"
              rules={[isRequired(IIsRequiredType.input), netmaskValidator()]}
            >
              <Input className="width-320" />
            </Form.Item>
          </>
        )}
      </Form>
    </DialogForm>
  );
};

export default EditConfig;
