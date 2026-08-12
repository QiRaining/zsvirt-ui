import type { ApolloError } from "@apollo/client";
import { gql, useMutation } from "@apollo/client";
import { Button, DialogFooter } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmSchedulingRuleMode } from "@zstack/zsphere-types";
import type {
  Cluster,
  CreateVmSchedulingRulePayload,
  Host,
  HostGroup,
  ValidateVmSchedulingRuleParam,
  ValidateVmSchedulingRuleResult,
  VmGroup,
  VmInstance,
  VmSchedulingRule,
} from "@zstack/zsphere-types/graphql";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import type { FormInstance } from "antd/es/form";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useCallback, useContext, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import { VmSchedulingRuleType } from "../../vm-scheduling-rule/create/types";
import BasicCard from "./basic-info";
import ConfigCard from "./config-info";

type IInitalValuesType = {
  name: string;
  description: string;
  type?: VmSchedulingRuleType;
  excuteMode?: VmSchedulingRuleMode;

  vmGroupType?: "available" | "new";
  // 选择已有虚拟机调度组
  vmGroup: Array<VmGroup>;
  // 新建虚拟机调度组
  vmGroupName?: string;
  vmList?: Array<VmInstance>;

  hostGroupType?: "available" | "new";
  // 选择已有主机调度组
  hostGroup?: Array<HostGroup>;
  // 新建主机调度组
  hostGroupName?: string;
  cluster?: Array<Cluster>;
  hostList?: Array<Host>;
};

const VALIDATE_VM_SCHEDULING_RULE = gql`
  mutation validateVmSchedulingRule($input: ValidateVmSchedulingRuleParam!) {
    validateVmSchedulingRule(input: $input) {
      success
    }
  }
`;

export const initialBasicValues: IInitalValuesType = {
  name: "",
  description: "",
  type: VmSchedulingRuleType.AntiAffinityVm,
  excuteMode: VmSchedulingRuleMode.HARD,
  vmGroupType: "available",
  vmGroup: [],
  hostGroupType: "available",
  hostGroup: [],
};

const CreatBackupStorage: React.FC<IActionWrapperProps<VmSchedulingRule>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();

  const createVmSchedulingRule = gql`
    mutation createVmSchedulingRule($input: CreateVmSchedulingRuleInput!) {
      createVmSchedulingRule(input: $input) {
        actionId
      }
    }
  `;
  const { zoneUuid } = useContext(ZoneUuidContext);

  const transformData = useCallback(
    (data: any) => {
      const { excuteMode, vmGroup, vmList, hostGroup, hostList, ...params } =
        _cloneDeep(data);
      if (
        [
          VmSchedulingRuleType.AffinityVm,
          VmSchedulingRuleType.VmAffinityHost,
        ].includes(data?.type)
      ) {
        params.rule = "AFFINITY";
      } else {
        params.rule = "ANTIAFFINITY";
      }
      params.mode = excuteMode;
      params.vmGroupUuid = vmGroup?.[0]?.uuid;
      params.vmUuids = vmList?.map((it: Host) => it?.uuid);
      params.hostGroupUuid = hostGroup?.[0]?.uuid;
      params.hostUuids = hostList?.map((it: Host) => it?.uuid);
      params.zoneUuid = zoneUuid;
      return params;
    },
    [zoneUuid],
  );

  const [validateVisible, setValidateVisible] = useState(false);
  const [validateMsg, setValidateMsg] = useState<string>();

  const handleErrorMessage = usePersistFn((e: ApolloError) => {
    const lang = getLocaleFromStorage() || "zh-CN";
    try {
      const { code, details = "", i18nDetails = "" } = JSON.parse(e.message);
      console.log("code===", code);
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
        setValidateMsg(lang === "zh-CN" ? i18nDetails : details);
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
        const {
          type: _type,
          vmGroupType: _vmGroupType,
          hostGroupType: _hostGroupType,
          ...params
        } = e;
        const payload: CreateVmSchedulingRulePayload = { ...params };
        doAction({
          mutation: createVmSchedulingRule,
          payload,
          name: intl.formatMessage({
            id: "create.vmSchedulingRule",
            defaultMessage: "New VM Scheduling Policy",
          }),
          total: 1,
          type: "VmSchedulingRule",
        });
        setVisible(false);
      } catch (error) {
        console.log("创建失败", error);
      }
    },
    [doAction, createVmSchedulingRule, intl],
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
            const data = transformData(form.getFieldsValue());
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
  }, [form, intl, setVisible, submitHandle, transformData, validateRule]);

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "create.vmSchedulingRule",
          defaultMessage: "New VM Scheduling Policy",
        })}
        form={form}
        widthClassName="w-150"
        visible={visible}
        setVisible={setVisible}
        footer={footer}
      >
        <Form form={form} ref={formRef} initialValues={initialBasicValues}>
          <BasicCard />
          <ConfigCard />
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

export default CreatBackupStorage;
