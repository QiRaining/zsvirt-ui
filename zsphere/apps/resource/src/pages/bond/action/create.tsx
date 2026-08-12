import { Input } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { Host } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { PciDeviceVirtStatus } from "../../physical-nic/constant";

const { Item } = Form;

export const useDefaultQueryNicForBond = (
  source?: Host,
  conditions?: any[],
) => {
  const defaultQuery = useMemo(() => {
    const defaultConditions = [
      {
        key: "hostUuid",
        value: source?.uuid,
      },
      {
        key: "ipAddresses",
        op: Op.notLike,
        value: source?.managementIp,
      },
      {
        key: "bondingUuid",
        op: Op.is,
        value: null as any,
      },
      {
        key: "pciDevice.virtStatus",
        op: Op.notIn,
        values: [
          PciDeviceVirtStatus.SRIOV_VIRTUALIZED,
          PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZED,
          PciDeviceVirtStatus.VIRTUALIZED_BYPASS_ZSTACK,
        ],
      },
      {
        key: "interfaceType",
        op: Op.ne,
        value: "bridgeSlave",
      },
    ];

    if (source?.callBackIp && source.callBackIp !== source.managementIp) {
      defaultConditions.push({
        key: "ipAddresses",
        op: Op.notLike,
        value: source?.callBackIp,
      });
    }

    return {
      conditions: [...defaultConditions, ...(conditions || [])],
      sortBy: "interfaceName",
    };
  }, [source, conditions]);

  return defaultQuery;
};

export const BondNameItem = ({
  required,
  width,
}: {
  required?: boolean;
  width?: number;
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  return (
    <Item
      name="bondingName"
      noStyle
      rules={[
        required ? isRequired() : {},
        {
          validator: (_rules, value) => {
            if (value && !value.match("^(?![0-9])[a-zA-Z0-9_-]{1,10}$")) {
              return Promise.reject(
                new Error(
                  intl.formatMessage({
                    id: "nic.modal.field.bondingName.validator",
                    defaultMessage:
                      "The name must be 1-10 characters in length and contains only English letters, digits, hyphens (-), and underscores (_).",
                  }),
                ),
              );
            }
            return Promise.resolve();
          },
        },
      ]}
      validateFirst
    >
      <Input style={{ width: width ?? 160 }} />
    </Item>
  );
};
