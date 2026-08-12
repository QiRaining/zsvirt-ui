import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ExternalPrimaryStoragePool,
  UpdateExternalPrimaryStoragePoolInput,
} from "@zstack/zsphere-types/graphql";
import { pick as _pick } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateExternalPrimaryStoragePool } from "../../../gql/external-primary-storage-pool.gql";
import {
  createUpdateVhostPrimaryStoragePoolSchema,
  type UpdateVhostPrimaryStoragePoolFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<ExternalPrimaryStoragePool>> = ({
  source,
  visible,
  refetch,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(
    () => createUpdateVhostPrimaryStoragePoolSchema(intl),
    [intl],
  );
  const defaultValues = useMemo<UpdateVhostPrimaryStoragePoolFormValues>(() => {
    const value: UpdateVhostPrimaryStoragePoolFormValues = {
      aliasName: "",
    };
    if (selectedList?.length) {
      value.aliasName = selectedList[0].aliasName ?? "";
    }
    return value;
  }, [selectedList]);

  const form = useForm<UpdateVhostPrimaryStoragePoolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const aliasNameError = form.getFieldState("aliasName").error;
          throw {
            errorFields: [
              {
                name: ["aliasName"],
                errors: aliasNameError?.message ? [aliasNameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );

  const onOk = async (values: UpdateVhostPrimaryStoragePoolFormValues) => {
    doAction<UpdateExternalPrimaryStoragePoolInput["payload"]>({
      mutation: updateExternalPrimaryStoragePool,
      payload: {
        config: {
          pools: source?.addonInfo.pools.map(
            (pool: ExternalPrimaryStoragePool) => {
              if (pool.name === selectedList[0]?.name) {
                return { name: pool.name, aliasName: values.aliasName };
              }

              return _pick(pool, ["name", "aliasName"]);
            },
          ),
        },
        uuid: source?.uuid,
      },
      type: "PrimaryStorageVO",
      name: intl.formatMessage({
        id: "change.displayName",
        defaultMessage: "Edit Display Name",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "set.displayName",
        defaultMessage: "Set Display Name",
      })}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="aliasName"
          label={intl.formatMessage({
            id: "displayName",
            defaultMessage: "Display Name",
          })}
          required
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
