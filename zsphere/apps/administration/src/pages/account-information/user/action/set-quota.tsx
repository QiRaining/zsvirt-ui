import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  AccountVO as IAccountVO,
  AccountQuotaUsage,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, parseNumber } from "@zstack/zsphere-utils";
import { InputNumber } from "antd";
import { cloneDeep as _cloneDeep, filter as _filter } from "lodash-es";
import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { updateAccountQuota } from "../../../../gql/account.gql";
import { useQuota } from "../../quota";

const STYLE_INPUT_NUMBER_WIDTH_160 = { width: "160px" } as const;
const STYLE_MARGIN_4_0_0_8 = { margin: "4px 0 0 8px" } as const;

interface wrapperProps extends IActionWrapperProps<IAccountVO> {
  quotaList: string[];
  typeName: string;
}

const Action: React.FC<wrapperProps> = ({
  visible,
  setVisible,
  quotaList = [],
  typeName = "",
  selectedList = [],
  refetch: _refetch,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const doAction = useAction();
  const [form] = Form.useForm();

  const account = selectedList[0];
  const Quota = useQuota();
  const quotaConfig: any = _cloneDeep(Quota);

  const usages = useMemo(
    () => account?.accountQuotaInfo?.usages ?? [],
    [account],
  );

  React.useEffect(() => {
    if (visible) {
      form.setFields(
        quotaList?.map((quota) => {
          const { unit } = quotaConfig[quota];

          const current: AccountQuotaUsage =
            _filter(usages, (it: AccountQuotaUsage) => it.name === quota)[0] ??
            {};

          const value =
            unit === "byte" ? formatSize(current.total!) : current.total;

          return {
            name: quota,
            value,
          };
        }) ?? [],
      );
    }
  }, [visible, quotaList, quotaConfig, form, usages]);

  const onOk = (values: any) => {
    const payload = quotaList.map((quota) => {
      const value =
        quotaConfig[quota].unit === "byte"
          ? parseNumber(values[quota]?.number, values[quota]?.unit)
          : values[quota];
      return {
        identityUuid: account.uuid,
        name: quota,
        value,
      };
    });
    doAction({
      mutation: updateAccountQuota,
      payload,
      name: intl.formatMessage({
        id: "set.subAccountQuota",
        defaultMessage: "Set User Quota",
      }),
      total: payload.length,
    });
    setVisible(false);
  };

  const formatSize = (number: number) => {
    const sizeStr = formatBytesToSize(number, "B");
    return {
      number: sizeStr.slice(0, sizeStr.length - 2),
      unit: sizeStr.slice(sizeStr.length - 2, sizeStr.length),
    };
  };

  const formatQuotaValue = useCallback(
    (value: string | number, quotaName: string) => {
      const _quota = quotaConfig[quotaName];
      return _quota?.unit === "byte"
        ? formatBytesToSize(value)
        : `${value} ${
            quotaConfig?.[quotaName]?.unit ??
            intl.formatMessage({ id: "input.unit.count", defaultMessage: " " })
          }`;
    },
    [intl, quotaConfig],
  );

  const getInputItem = (quota: string) => {
    const item = quotaConfig[quota];
    const unitList: Required<IInputUnitProps>["unitList"] = ["MB", "GB", "TB"];
    return (
      <Form.Item
        key={quota}
        label={item.name}
        icon={item.info ? "info" : undefined}
        iconTooltip={
          item.info ? <ReactMarkdown>{item.info}</ReactMarkdown> : undefined
        }
      >
        <Form.Item
          name={quota}
          noStyle
          label={item?.name}
          rules={[
            isRequired(),
            {
              validator: (_, v) => {
                if (quota === "vm.totalNum") {
                  return v < form.getFieldValue("vm.num")
                    ? Promise.reject(
                        intl.formatMessage({
                          id: "vmCount.nlt.vmRunningCount",
                          defaultMessage: "The number of virtual machines cannot be less than that of the running virtual machines.",
                        }),
                      )
                    : Promise.resolve();
                }
                if (quota === "vm.num") {
                  return v > form.getFieldValue("vm.totalNum")
                    ? Promise.reject(
                        intl.formatMessage({
                          id: "vmRunningCount.ngt.vmCount",
                          defaultMessage: "The number of running virtual machines cannot be more than that of virtual machines.",
                        }),
                      )
                    : Promise.resolve();
                }
                return Promise.resolve();
              },
            },
            {
              validator: (_, v) => {
                const current: AccountQuotaUsage = _filter(
                  usages,
                  (it: AccountQuotaUsage) => it.name === quota,
                )[0];

                const value =
                  quotaConfig[quota].unit === "byte"
                    ? parseNumber(v.number, v.unit)
                    : v;

                return value < (current?.used ?? 0)
                  ? Promise.reject(
                      intl.formatMessage(
                        {
                          id: "quota.field.usedNum.format",
                          defaultMessage: "The total quantity cannot be smaller than the used quantity { num }.",
                        },
                        {
                          num: formatQuotaValue(current?.used ?? 0, quota),
                        },
                      ),
                    )
                  : Promise.resolve();
              },
            },
          ]}
        >
          {item?.unit === "byte" ? (
            <InputUnit inputWidth={160} unitList={unitList} />
          ) : (
            <InputNumber style={STYLE_INPUT_NUMBER_WIDTH_160} />
          )}
        </Form.Item>

        {item?.unit !== "byte" && intl.locale === "zh-CN" && (
          <span style={STYLE_MARGIN_4_0_0_8}>
            {item.unit ||
              intl.formatMessage({
                id: "input.unit.count",
                defaultMessage: " ",
              })}
          </span>
        )}
      </Form.Item>
    );
  };

  const quotaItemList = useMemo(() => {
    return quotaList.map((quota) => getInputItem(quota));
  }, [getInputItem, quotaList]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage(
        {
          id: "set.subAccountQuota.title",
          defaultMessage: "Edit User Quota: {type}",
        },
        {
          type: typeName,
        },
      )}
      form={form}
      alertMessage={intl.formatMessage({
        id: "subAccountManagement.modal.set.subAccountQuota.alert.info",
        defaultMessage: "Modifying a quota will affect the operation of resources managed by the sub-account. Proceed with caution.",
      })}
      alertType="info"
      onOk={onOk}
    >
      <Form form={form}>{quotaItemList}</Form>
    </DialogForm>
  );
};

export default Action;
