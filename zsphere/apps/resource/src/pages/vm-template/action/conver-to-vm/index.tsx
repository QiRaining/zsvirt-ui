import { gql } from "@apollo/client";
import { Checkbox, RadioGroup } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ResourceQueryType, VmCreationStrategy } from "@zstack/zsphere-types";
import type {
  ConverTemplateToVMPayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";

import RunInPosition from "./run-position";
import { validatorUniqName } from "./run-position/validate-name";

enum TpmConfigMethodEnum {
  Retain = "Retain",
  Reset = "Reset",
}

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

const coverTemplateToVM = gql`
  mutation coverTemplateToVM($input: ConverTemplateToVMInput!) {
    coverTemplateToVM(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { commonNameRules } = useValidator(intl);

  const hasTpm = useMemo(() => {
    return (selectedList?.[0] as any)?.tpmList?.length > 0;
  }, [selectedList]);

  useEffect(() => {
    if (selectedList?.[0]?.name && visible) {
      form.setFieldsValue({
        name: selectedList?.[0]?.name,
        runPath: [selectedList?.[0]?.host || selectedList?.[0]?.lastHost],
      });
    }
  }, [form, selectedList, visible]);

  const onOk = async (values: any) => {
    const payload: ConverTemplateToVMPayload = {
      name: values?.name,
      vmTemplateUuid: selectedList?.[0]?.uuid,
      strategy: values?.strategy
        ? VmCreationStrategy.InstantStart
        : VmCreationStrategy.CreateStopped,
    };

    if (
      values?.runPath &&
      values.runPath?.[0]?.resourceType === "host" &&
      values?.strategy
    ) {
      payload.hostUuid = values.runPath?.[0]?.uuid;
    }

    // 处理TPM配置方式
    // 如果用户选择了配置方式，根据选择设置 resetTpm
    // 如果用户没有选择，不传 resetTpm 参数，后端会从 ResourceConfig 读取（category=kvm, name=reset.tpm.after.vm.clone）
    if (hasTpm && values?.tpmConfigMethod) {
      if (values.tpmConfigMethod === TpmConfigMethodEnum.Reset) {
        payload.resetTpm = true;
      } else if (values.tpmConfigMethod === TpmConfigMethodEnum.Retain) {
        payload.resetTpm = false;
      }
    }

    doAction({
      mutation: coverTemplateToVM,
      payload: [payload],
      name: intl.formatMessage({
        id: "vm.template.cover.to.vm",
        defaultMessage: "Convert Template to Virtual Machine",
      }),
      total: 1,
      type: "VmTemplate",
      onFinish: (result: IActionResult) => {
        if (result?.inventory?.uuid && result?.success === 1) {
          navigate({
            pathname: "/virtualization-resource/vm/detail",
            search: `?uuid=${result.inventory.uuid}&leftnav=virtualization.cluster.host&navView=resource`,
          });
        }
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "vm.template.modal.title.confirm.convert.to.instance`",
        defaultMessage: "Convert to Virtual Machine",
      })}
      resourceName={selectedList?.[0]?.name || ""}
    >
      <Form form={form}>
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          rules={[
            ...commonNameRules,
            validatorUniqName(
              intl,
              ResourceQueryType.VmInstance,
              undefined,
              intl.formatMessage({
                id: "instance.field.name.validator.duplicate",
                defaultMessage: "This name is already in use. Enter a different name.",
              }),
              true,
            ),
          ]}
        >
          <Input className="width-320" />
        </Form.Item>
        <Form.Item
          name="strategy"
          label={intl.formatMessage({
            id: "vm.run.status",
            defaultMessage: "Power Status",
          })}
          valuePropName="checked"
        >
          <FormCheckbox
            label={intl.formatMessage({
              id: "start.after.convert",
              defaultMessage: "Power on after conversion",
            })}
          />
        </Form.Item>
        {hasTpm && (
          <Form.Item
            label={intl.formatMessage({
              id: "tpm.config.method",
              defaultMessage: "TPM Configuration",
            })}
            name="tpmConfigMethod"
            initialValue={TpmConfigMethodEnum.Retain}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "vm.clone.field.tpmConfigMethod.tooltip",
                  defaultMessage: `### TPM Configuration

Select how TPM devices are handled during the clone operation:

- Retain: The cloned VM retains the TPM information from the source VM.
- Reset: The system creates a new TPM for the cloned VM using the default key provider.`,
                })}
              </ReactMarkdown>
            }
          >
            <RadioGroup
              options={[
                {
                  value: TpmConfigMethodEnum.Retain,
                  label: intl.formatMessage({
                    id: "tpm.config.method.retain",
                    defaultMessage: "Retain",
                  }),
                },
                {
                  value: TpmConfigMethodEnum.Reset,
                  label: intl.formatMessage({
                    id: "tpm.config.method.reset",
                    defaultMessage: "Reset",
                  }),
                },
              ]}
            />
          </Form.Item>
        )}
        <Form.Item
          noStyle
          shouldUpdate={(pre, cur) => pre.strategy !== cur.strategy}
        >
          {() => {
            const strategy = form.getFieldValue("strategy");

            const allVolumesPSTypes = _.uniq(
              selectedList?.[0]?.allVolumes?.map(
                (volume: any) => volume.primaryStorage?.type,
              ),
            );

            if (allVolumesPSTypes.includes("LocalStorage")) {
              return (
                <Form.Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.run.path",
                    defaultMessage: "Location",
                  })}
                  name="runPath"
                >
                  {selectedList?.[0]?.host?.name ||
                    selectedList?.[0]?.lastHost?.name}
                </Form.Item>
              );
            }

            return (
              strategy && (
                <RunInPosition form={form} vmUuid={selectedList?.[0]?.uuid} />
              )
            );
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
