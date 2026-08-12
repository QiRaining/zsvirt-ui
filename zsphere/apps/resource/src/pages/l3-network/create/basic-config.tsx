import { L2NetworkSelectTab } from "@zstack/virtualization-resource/src/pages/l3-network/create/select-l2";
import VlanConfig from "@zstack/virtualization-resource/src/pages/l3-network/create/vlan-config";
import { Form } from "@zstack/zsphere-components";
import {
  ModalSelect,
  InputDebounce,
  TextArea,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import {
  L2NetworkQueryType,
  Op,
  ResourceQueryType,
} from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  source?: any;
}

const { Item } = Form;

const BasicPart: React.FC<IProps> = ({ source }) => {
  const intl = useIntl();
  const form = Form.useFormInstance()!;
  const {
    commonNameRules,
    longDescriptionRules,
    isRequired,
    validatorUniqName,
  } = useValidator(intl);

  const defaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "cluster.hypervisorType",
        op: Op.ne,
        value: "ESX",
      },
      {
        key: "type",
        op: Op.notIn,
        values: ["VxlanNetworkPool", "HardwareVxlanNetworkPool", "portGroup"],
      },
    ];

    if (source?.__typename === "Cluster") {
      conditions.push({
        key: "cluster.uuid",
        op: Op.in,
        values: [source.uuid],
      });
    }

    return {
      conditions,
      type: L2NetworkQueryType.CreateL3AllCandidate,
    };
  }, [source?.__typename, source?.uuid]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
      </div>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.L3Network,
            undefined,
            intl.formatMessage({
              id: "l3Network.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <InputDebounce className={styles.baseFormItem} />
      </Item>
      <Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={longDescriptionRules}
      >
        <TextArea
          rows={3}
          isShowLimit
          maxLength={2000}
          className={styles.baseFormItem}
        />
      </Item>
      <div className={styles.title}>
        {intl.formatMessage({ id: "config.info", defaultMessage: "Configurations" })}
      </div>
      <Item
        name="l2Network"
        label={intl.formatMessage({
          id: "virtualization.l2.network",
          defaultMessage: "Distributed Switch",
        })}
        required
        rules={[
          isRequired(
            IIsRequiredType.select,
            intl.formatMessage({
              id: "virtualization.l2.network",
              defaultMessage: "Distributed Switch",
            }),
          ),
        ]}
      >
        <ModalSelect
          className={styles.baseFormItem}
          title={intl.formatMessage({
            id: "virtualization.select.l2.network",
            defaultMessage: "Select Distributed Switch",
          })}
          // 更换选项清空校验
          onChange={() => {
            form.resetFields(["vlan"]);
          }}
        >
          <L2NetworkSelectTab
            view="select.virtualization.l3"
            defaultQuery={defaultQuery}
            reSelect={false}
          />
        </ModalSelect>
      </Item>

      <VlanConfig
        vlanRules={[
          () => ({
            validator(rule, val) {
              if (val) {
                const inputVlanId = Number(val);
                if (inputVlanId >= 1 && inputVlanId <= 4094) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  Error(
                    intl.formatMessage({
                      id: "L2Network.vlan.validator.invalid",
                      defaultMessage: "Invalid VLAN ID.",
                    }),
                  ),
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
    </div>
  );
};

export default React.memo(BasicPart);
