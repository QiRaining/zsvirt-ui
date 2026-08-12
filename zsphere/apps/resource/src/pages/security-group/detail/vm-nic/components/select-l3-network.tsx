import { RadioGroup } from "@zstack/design";
import { getZoneUuidFromLocation } from "@zstack/virtualization-reliability/src/pages/vm-scheduling-rule/common";
import { queryL3NetworkList } from "@zstack/virtualization-resource/src/gql/port-group.gql";
import { Form, Select, useQuery } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IQuery } from "@zstack/zsphere-types";
import { Identity, L3NetworkType, Op } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";
interface SelectL3NetworkProps {
  form: FormInstance;
  onSelectedValueChange: (value: any) => void;
}
const noPublicOptionIdentity = [
  Identity.NormalAccount,
  Identity.ProjectOperator,
];
function useNetworkTypeMap() {
  const intl = useIntl();
  const networkTypeMap = useMemo(() => {
    return new Map([
      [
        "all",
        {
          name: intl.formatMessage({
            id: "all.portGroup",
            defaultMessage: "All Port Group",
          }),
          title: intl.formatMessage({
            id: "all.portGroup",
            defaultMessage: "All Port Group",
          }),
        },
      ],
      [
        L3NetworkType.public,
        {
          name: intl.formatMessage({
            id: "specify.publicNetwork",
            defaultMessage: "Specify Port Group",
          }),
          title: intl.formatMessage({
            id: "select.specify.publicNetwork",
            defaultMessage: "Select a specified port group.",
          }),
        },
      ],
    ]);
  }, [intl]);

  return { networkTypeMap };
}

export function useDefaultNetworkType() {
  const { currentUser } = usePlatformStore();

  // const { networkTypeMap } = useNetworkTypeMap()

  const defaultL3NetworkType = useMemo(() => {
    const networkType = noPublicOptionIdentity.includes(
      currentUser?.currentIdentity,
    )
      ? L3NetworkType.flat
      : L3NetworkType.public;

    return networkType;
  }, [currentUser.currentIdentity]);

  return {
    defaultL3NetworkType,
  };
}

function useL3NetworkOptions(type: string, defaultQuery: IQuery) {
  const { zoneUuid } = getZoneUuidFromLocation();

  const newDefaultQuery = useMemo(() => {
    const query: IQuery = {
      ...defaultQuery,
      conditions: [
        ...(defaultQuery?.conditions ?? []),
        { key: "defaultFilter", value: "NOT_DEFAULT" },
        {
          key: "networkServices.networkServiceType",
          op: Op.eq,
          value: "SecurityGroup",
        },
        {
          key: "system",
          op: Op.eq,
          value: "false",
        },
        {
          key: "l2Network.cluster.type",
          op: Op.eq,
          value: "zstack",
        },
      ],
    };

    if (zoneUuid) {
      query.conditions?.push({
        key: "zoneUuid",
        op: Op.eq,
        value: zoneUuid,
      });
    }

    if (type === L3NetworkType.vpc) {
      query.conditions?.push({
        key: "vmNic.uuid",
        op: Op.not,
        value: undefined,
      });
    }
    return query;
  }, [defaultQuery, type, zoneUuid]);

  const { data, loading, error } = useQuery(queryL3NetworkList, {
    fetchPolicy: "network-only",
    variables: {
      conditions: newDefaultQuery.conditions,
    },
  });

  const options = useMemo(() => {
    if (loading || error || !data) {
      return [];
    }
    return (
      data.l3NetworkList?.list.map((network) => ({
        label: network.name,
        value: network.uuid,
        ip: network.dhcpIp?.ipv4 || "-",
      })) || []
    );
  }, [data, loading, error]);

  return { options, loading };
}
const L3NetworkSelect: FC<any> = ({
  l3NetworkType,
  form,
  onSelectedValueChange,
}) => {
  const { options, loading } = useL3NetworkOptions(l3NetworkType || "all", {});
  const intl = useIntl();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleChange = (value: any) => {
    onSelectedValueChange(value);
  };
  return (
    <Select
      mode="multiple"
      style={selectFullWidthStyle}
      checkable
      virtual={false}
      options={options}
      open={dropdownVisible}
      loading={loading}
      onDropdownVisibleChange={(open) => setDropdownVisible(open)}
      showArrow={true}
      onChange={handleChange}
      dropdownRender={(menu) => (
        <div>
          {menu}
          <div className={styles["options-container"]}>
            {options.map((option, index) => (
              <div
                key={option.value}
                className={styles["network-ip"]}
                style={{
                  top: `${index * 30 + 8}px`,
                }}
              >
                {option.ip}
              </div>
            ))}
          </div>
          <div className={styles["bottom-container"]}>
            <span
              className={
                form.getFieldValue("l3Network")?.length
                  ? styles.reset
                  : styles["reset-disable"]
              }
              onClick={() => {
                form.setFieldsValue({ l3Network: [] });
              }}
            >
              {intl.formatMessage({
                id: "reset",
                defaultMessage: "Reset",
              })}
            </span>
            <span
              className={styles.confirmbtn}
              onClick={() => {
                setDropdownVisible(false);
              }}
            >
              {intl.formatMessage({
                id: "confirmbtn",
                defaultMessage: "OK",
              })}
            </span>
          </div>
        </div>
      )}
    />
  );
};

const selectFullWidthStyle = { width: "100%" } as const;
const divMarginBottomStyle = { marginBottom: 12 } as const;
const formItemNoMarginStyle = { marginBottom: 0 } as const;

const SelectL3Network: FC<SelectL3NetworkProps> = ({
  form,
  onSelectedValueChange,
}) => {
  const { networkTypeMap } = useNetworkTypeMap();

  const radioOptions = useMemo(() => {
    return [...networkTypeMap].map(([key, { name }]) => ({
      value: key,
      label: name,
    }));
  }, [networkTypeMap]);

  return (
    <Form.Item noStyle>
      <div id="createSecurityGroupSelectNetwork" style={divMarginBottomStyle}>
        <Form.Item name="l3NetworkType" style={formItemNoMarginStyle}>
          <RadioGroup
            onValueChange={(_value) => {
              form.setFields([{ name: "l3Network", value: [] }]);
              onSelectedValueChange([]);
            }}
            options={radioOptions}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev.l3NetworkType !== curr.l3NetworkType
          }
        >
          {({ getFieldValue }) => {
            const l3NetworkType = getFieldValue("l3NetworkType");
            if (!l3NetworkType || l3NetworkType === "all") {
              return null;
            }

            return (
              <Form.Item
                name="l3Network"
                style={formItemNoMarginStyle}
                hideRequiredMessage
              >
                <L3NetworkSelect
                  type={l3NetworkType}
                  form={form}
                  onSelectedValueChange={onSelectedValueChange}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      </div>
    </Form.Item>
  );
};

export default SelectL3Network;
