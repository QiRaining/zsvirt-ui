import type { ApolloError } from "@apollo/client";
import { gql, useMutation } from "@apollo/client";
import { Button, DialogFooter } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UpdateVmSchedulingRulePayload,
  ValidateVmSchedulingRuleParam,
  ValidateVmSchedulingRuleResult,
  VmSchedulingRule,
} from "@zstack/zsphere-types/graphql";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import type { FormInstance } from "antd/es/form";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { VmSchedulingRuleType } from "../../../vm-scheduling-rule/create/types";
import BasicCard from "./basic-info";

type IInitalValuesType = {
  name: string;
  description: string;
  rule?: string;
  mode?: string;
};

const VALIDATE_VM_SCHEDULING_RULE = gql`
  mutation validateVmSchedulingRule($input: ValidateVmSchedulingRuleParam!) {
    validateVmSchedulingRule(input: $input) {
      success
    }
  }
`;

const updateVmSchedulingRule = gql`
  mutation updateVmSchedulingRule($input: UpdateVmSchedulingRuleInput!) {
    updateVmSchedulingRule(input: $input) {
      actionId
    }
  }
`;

const ModifyConfigAction: React.FC<
  Omit<IActionWrapperProps<VmSchedulingRule>, "view" | "position">
> = ({ visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();

  const initialBasicValues: IInitalValuesType = useMemo(() => {
    const _value = {
      name: "",
      description: "",
      rule: "",
      mode: "",
    };
    const current = selectedList?.[0];
    if (current) {
      _value.name = current?.name;
      _value.description = current?.description ?? "";
      _value.rule = current?.rule ?? "";
      _value.mode = current?.mode ?? "";
    }
    return _value;
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialBasicValues);
    }
  }, [visible]);

  const [validateVisible, setValidateVisible] = useState(false);
  const [validateMsg, setValidateMsg] = useState<string>();

  const handleErrorMessage = usePersistFn((e: ApolloError) => {
    const lang = getLocaleFromStorage() || "zh-CN";
    try {
      const {
        code,
        messages: errorMessages,
        details = "",
      } = JSON.parse(e.message);
      if (
        [
          "vmSchedulingRule.3001",
          "vmSchedulingRule.3002",
          "vmSchedulingRule.3003",
          "vmSchedulingRule.3004",
          "vmSchedulingRule.3005",
          "vmSchedulingRule.3006",
          "vmSchedulingRule.3007",
          "vmSchedulingRule.3008",
          "vmSchedulingRule.3009",
          "vmSchedulingRule.3010",
          "vmSchedulingRule.3011",
        ].includes(code)
      ) {
        setValidateMsg(
          (lang === "zh-CN"
            ? errorMessages?.message_cn
            : errorMessages?.message_en) || details,
        );
      } else {
        setValidateMsg(details);
      }
      setValidateVisible(true);
    } catch (error) {
      setValidateVisible(false);
      console.log(error);
    }
  });

  const [_validateVmSchedulingRule] = useMutation<
    { validateVmSchedulingRule: ValidateVmSchedulingRuleResult },
    {
      input: ValidateVmSchedulingRuleParam;
    }
  >(VALIDATE_VM_SCHEDULING_RULE, {
    onError: handleErrorMessage,
  });

  const validateRule = useCallback(
    async (data: any) => {
      const {
        type,
        vmGroupType,
        hostGroupType,
        vmGroupUuid,
        hostGroupUuid,
        rule,
        mode,
      } = _cloneDeep(data);
      // 先验证，注意虚拟机调度组和主机调度组都选择已有时才验证
      const whetherValidate = [
        VmSchedulingRuleType.AffinityVm,
        VmSchedulingRuleType.AntiAffinityVm,
      ].includes(type)
        ? vmGroupType === "available"
        : vmGroupType === "available" && hostGroupType === "available";
      if (whetherValidate) {
        const validateResult = await _validateVmSchedulingRule({
          variables: {
            input: {
              vmGroupUuid,
              hostGroupUuid,
              rule,
              mode,
            },
          },
        });
        if (!!validateResult?.errors || validateMsg) {
          return false;
        }
      }
      return true;
    },
    [_validateVmSchedulingRule, validateMsg],
  );

  const submitHandle = useCallback(
    async (e: any) => {
      try {
        const { type: _type, rule: _rule, ...params } = e;
        const payload: UpdateVmSchedulingRulePayload = {
          ...params,
          uuid: selectedList?.[0]?.uuid,
        };
        doAction({
          mutation: updateVmSchedulingRule,
          payload,
          name: intl.formatMessage({
            id: "modify.config",
            defaultMessage: "Modify Configuration",
          }),
          total: 1,
          type: "VmSchedulingRule",
        });
        setVisible(false);
      } catch (error) {
        console.log("创建失败", error);
      }
    },
    [doAction, intl],
  );

  const footer = useMemo(() => {
    return (
      <DialogFooter className="gap-2">
        <Button
          variant="subtle"
          onClick={() => {
            setVisible(false);
            form.resetFields();
          }}
        >
          {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
        </Button>
        <Button
          variant="primary"
          onClick={async () => {
            await form.validateFields();
            const data = _cloneDeep(form.getFieldsValue());
            const checkPass = await validateRule(data);
            if (!checkPass) {
              setValidateVisible(true);
            } else {
              submitHandle(data);
              form.resetFields();
            }
          }}
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      </DialogFooter>
    );
  }, [form, intl, setVisible, submitHandle, validateRule]);

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "modify.config",
          defaultMessage: "Modify Configuration",
        })}
        form={form}
        widthClassName="w-150"
        visible={visible}
        setVisible={setVisible}
        footer={footer}
        resourceName={selectedList?.[0]?.name}
      >
        <Form form={form} ref={formRef} initialValues={initialBasicValues}>
          <BasicCard form={form} current={selectedList?.[0]} />
        </Form>
      </DialogForm>

      <DialogBase
        title={intl.formatMessage({
          id: "vmSchedulingRule.modal.validate.result.error",
          defaultMessage: "VM Scheduling Policy Conflicted",
        })}
        visible={validateVisible}
        setVisible={setValidateVisible}
        hideCancelButton
        onOk={() => setValidateMsg("")}
      >
        {validateMsg}
      </DialogBase>
    </>
  );
};

export default ModifyConfigAction;
