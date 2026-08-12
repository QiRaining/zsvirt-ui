import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputNumber,
} from "@zstack/design";
import {
  FieldStack,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import type { IconTypes } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorage,
  UpdateResourceConfigsPayload,
} from "@zstack/zsphere-types/graphql";
import { reduce, keys, forEach } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createModifyResourceConfigSchema,
  type ModifyResourceConfigFormValues,
} from "./schema";
import { useAdvancedSettings } from "./useAdvanceSettings";

import style from "./style.module.less";

const OVER_PROVISIONING_KEY = "mevoco-overProvisioning.primaryStorage";

const toConfigFieldName = (key: string) =>
  key.replaceAll(".", "__dot__").replaceAll("-", "__dash__");

const fromConfigFieldName = (fieldName: string) =>
  fieldName.replaceAll("__dash__", "-").replaceAll("__dot__", ".");

const _updateResourceConfigs = gql`
  mutation updateResourceConfigs($input: UpdateResourceConfigsInput!) {
    updateResourceConfigs(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const detail = selectedList?.[0];

  const { editConfigList, refetch } = useAdvancedSettings(detail);

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title = intl.formatMessage({
    id: "modify.advance.settings",
    defaultMessage: "Modify Advanced Settings",
  });

  const defaultValues = useMemo<ModifyResourceConfigFormValues>(() => {
    const configs = reduce(
      editConfigList || [],
      (obj, it) => {
        obj[toConfigFieldName(`${it?.category}-${it?.name}`)] = it?.value;
        return obj;
      },
      {} as Record<string, string | number | undefined>,
    );

    return { configs };
  }, [editConfigList]);
  const formSchema = useMemo(
    () =>
      createModifyResourceConfigSchema(
        intl,
        toConfigFieldName(OVER_PROVISIONING_KEY),
      ),
    [intl],
  );
  const form = useForm<ModifyResourceConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (data: ModifyResourceConfigFormValues) => {
    const payload: UpdateResourceConfigsPayload[] = [
      {
        resourceUuid: current?.uuid,
        resourceConfigs: [],
      },
    ];
    forEach(keys(data.configs), (fieldName) => {
      const key = fromConfigFieldName(fieldName);
      const [category, name] = key.split("-");
      const value = data.configs[fieldName];

      payload[0].resourceConfigs.push({
        category,
        name,
        value: String(value),
      });
    });

    doAction({
      mutation: _updateResourceConfigs,
      payload,
      name: title,
      total: payload?.length || 1,
      type: "PrimaryStorageVO",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const RenderFc = (
    key: string,
    label: string | React.ReactNode,
    value: string | undefined,
    iconTooltipInfo: {
      icon?: IconTypes;
      iconTooltip?: string | React.ReactNode;
    },
  ) => {
    let formItemDom;

    const sharedblockDeviceAllocateStrategySelectList = [
      {
        value: "none",
        displayName: intl.formatMessage({
          id: "globalConfig.sortByDriveLetter",
          defaultMessage: "none",
        }),
      },
      {
        value: "maxFreeSize",
        displayName: intl.formatMessage({
          id: "globalConfig.maxFreeSize",
          defaultMessage: "maxFreeSize",
        }),
      },
      {
        value: "minLvCounts",
        displayName: intl.formatMessage({
          id: "globalConfig.minLvCounts",
          defaultMessage: "minLvCounts",
        }),
      },
    ];

    const sharedblockQcow2AllocationSelectList =
      key === "sharedblock-qcow2.allocation"
        ? ["metadata", "none"]
        : ["full", "metadata", "falloc", "none"];

    switch (key) {
      case "mevoco-overProvisioning.primaryStorage":
        formItemDom = (
          <FormField
            control={form.control}
            name={`configs.${toConfigFieldName(key)}`}
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel
                  info={iconTooltipInfo.iconTooltip}
                  required
                  className="mt-[5px] flex"
                >
                  {label}
                </FormLabel>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <InputNumber
                        className={style["w-80"]}
                        step={0.01}
                        precision={2}
                        value={field.value === undefined ? "" : field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <span>: 1</span>
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        );
        break;
      case "sharedblock-device.allocate.strategy":
        formItemDom = (
          <SelectField
            form={form}
            label={label}
            name={`configs.${toConfigFieldName(key)}`}
            required
            labelTooltip={iconTooltipInfo.iconTooltip}
            size="l"
            options={sharedblockDeviceAllocateStrategySelectList?.map(
              (item: any) => ({
                label: item.displayName,
                value: item.value,
              }),
            )}
          />
        );
        break;
      case "nfsPrimaryStorage-qcow2.allocation":
      case "localStoragePrimaryStorage-qcow2.allocation":
      case "sharedblock-qcow2.allocation":
        formItemDom = (
          <SelectField
            form={form}
            label={label}
            name={`configs.${toConfigFieldName(key)}`}
            labelTooltip={iconTooltipInfo.iconTooltip}
            size="m"
            options={sharedblockQcow2AllocationSelectList?.map(
              (item: string) => ({
                label: item,
                value: item,
              }),
            )}
          />
        );
        break;
      default:
        formItemDom = (
          <FormField
            control={form.control}
            name={`configs.${toConfigFieldName(OVER_PROVISIONING_KEY)}`}
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel
                  info={iconTooltipInfo.iconTooltip}
                  required
                  className="mt-[5px] flex"
                >
                  {label}
                </FormLabel>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <InputNumber
                        className={style["w-80"]}
                        step={0.01}
                        precision={2}
                        value={field.value === undefined ? "" : field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <span>: 1</span>
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        );
        break;
    }
    return formItemDom;
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={title}
      widthClassName="w-150"
      onCancel={() => setVisible(false)}
      onOk={onOk}
      className={style["create-modal"]}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <FieldStack className={style.form}>
          {editConfigList?.map((it: any) => {
            return (
              <>
                {RenderFc(`${it?.category}-${it?.name}`, it?.label, it?.value, {
                  icon: it?.icon,
                  iconTooltip: it?.iconTooltip,
                })}
              </>
            );
          })}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
