import { RadioGroup } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { InputDebounce } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType, PortGroupVlanMode } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import type { FC } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import { useIntl } from "react-intl";
import IpConfig from "zsv_resource/l3-network/create/ip-config";
import VlanConfig from "zsv_resource/l3-network/create/vlan-config";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import type { IWizardFormProps } from "../interface";
import { useL2Network } from "./hooks/use-l2-network";
import { useL2NetworkOptions } from "./hooks/use-l2-network-options";
import { useSubmitAction } from "./hooks/use-submit-action";
import { L2NetworkForm } from "./l2-network-form";

import styles from "./style.module.less";

const { Item } = Form;

export const initialValues = {
  name: "DSwitch-1",
  description: "",
  ipVersion: 4,
  isByCidr: false,
  enableIPAM: false,
  dhcpService: false,
  clusterUuids: [],
  l3networkName: "DPortGroup-1",
  vlanMode: PortGroupVlanMode.NONE,
};

interface IL3NetworkCreatorProps extends IWizardFormProps {}

export const L3NetworkCreator: FC<IL3NetworkCreatorProps> = forwardRef(
  (props, ref) => {
    const { handleTaskFinished } = props;
    const intl = useIntl();
    const [form] = Form.useForm();
    const { commonNameRules, validatorUniqName } = useValidator(intl);

    const { zoneUuid, clusterUuid } = useWizardStore(
      useShallow((state) => ({
        zoneUuid: state.zoneUuid,
        clusterUuid: state.clusterUuid,
      })),
    );

    const submit = async () => {
      await form.validateFields();
      form.submit();
    };

    useImperativeHandle(ref, () => ({
      submit,
    }));

    const { data: l2NetworkData } = useL2Network(clusterUuid);
    const handleFinish = useSubmitAction(
      clusterUuid,
      zoneUuid,
      handleTaskFinished,
      form,
    );

    const formRef = React.createRef<FormInstance>();

    const l2NetworkOptions = useL2NetworkOptions();

    const handleChangeL2NetworkOption = (value: string) => {
      form.setFieldsValue({
        l2NetworkOption: value,
      });
      form.resetFields(["vlan"]);
    };

    return (
      <div className={styles.formWrapper}>
        <Form
          form={form}
          ref={formRef}
          initialValues={initialValues}
          onFinish={handleFinish}
        >
          <div className={styles.title}>
            {intl.formatMessage({
              id: "basic.info",
              defaultMessage: "Basic Info",
            })}
          </div>
          <Item
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            name="l3networkName"
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
            labelWidth={160}
            label={intl.formatMessage({
              id: "wizard.create.l2.network.form.label.choose.l2",
              defaultMessage: "Distributed Switch",
            })}
            textFormItem
            className={styles.ipAllocateStrategy}
          >
            <Item name="l2NetworkOption" initialValue="default" noStyle>
              <RadioGroup
                options={l2NetworkOptions}
                onValueChange={handleChangeL2NetworkOption}
              />
            </Item>
          </Item>

          <L2NetworkForm form={form} />

          <div className={styles.title}>
            {intl.formatMessage({
              id: "config.info",
              defaultMessage: "Configurations",
            })}
          </div>

          <VlanConfig
            vlanRules={[
              () => ({
                validator(rule, values) {
                  if ((values >= 1 && values <= 4094) || !values) {
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
                },
              }),
              () => ({
                validator(rule, val) {
                  if (form.getFieldValue("l2NetworkOption") === "default") {
                    const inputVlanId = Number(val) || 0;
                    const selectedL2Network =
                      l2NetworkData?.l2NetworkList.list?.[0];
                    const hasConflictVlanId =
                      selectedL2Network?.portGroups?.some(
                        (portGroup: { vlanId: number }) =>
                          portGroup.vlanId === inputVlanId,
                      );
                    if (hasConflictVlanId) {
                      return Promise.reject(
                        Error(
                          intl.formatMessage({
                            id: "L2Network.vlan.validator.invalid.exit.conflict",
                            defaultMessage: "Duplicate VLAN ID, please re-input.",
                          }),
                        ),
                      );
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
          <IpConfig />
        </Form>
      </div>
    );
  },
);
