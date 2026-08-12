import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, FieldStack } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { CephPrimaryStoragePoolType } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router";

import {
  createAddCephPrimaryStoragePoolSchema,
  type AddCephPrimaryStoragePoolFormValues,
} from "./schema";

const addCephPrimaryStoragePool = gql`
  mutation addCephPrimaryStoragePool($input: AddCephPrimaryStoragePoolInput!) {
    addCephPrimaryStoragePool(input: $input) {
      actionId
    }
  }
`;

const initialValues: AddCephPrimaryStoragePoolFormValues = {
  poolName: "",
  aliasName: "",
};

const Action: React.FC<IActionWrapperProps<ICephPrimaryStoragePool>> = ({
  refetch,
  visible,
  setVisible,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(
    () => createAddCephPrimaryStoragePoolSchema(intl),
    [intl],
  );
  const form = useForm<AddCephPrimaryStoragePoolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
  const [searchParams] = useSearchParams();
  const primaryStorageUuid = searchParams.get("uuid") || "";

  const handleOk = async (values: AddCephPrimaryStoragePoolFormValues) => {
    doAction({
      mutation: addCephPrimaryStoragePool,
      payload: [
        {
          primaryStorageUuid,
          ...values,
          type: CephPrimaryStoragePoolType.Data,
        },
        {
          primaryStorageUuid,
          ...values,
          type: CephPrimaryStoragePoolType.Root,
        },
      ],
      name: intl.formatMessage({
        id: "add.cephPrimaryStoragePool",
        defaultMessage: "Add Storage Pool",
      }),
      type: "CephPrimaryStoragePool",
      total: 1,
      onFinish: () => {
        refetch?.();
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  useEffect(() => {
    if (visible) {
      form.reset(initialValues);
    }
  }, [form, visible]);

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const poolNameError = form.getFieldState("poolName").error;
          throw {
            errorFields: [
              {
                name: ["poolName"],
                errors: poolNameError?.message ? [poolNameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(initialValues);
      },
    }),
    [form],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={handleOk}
      title={intl.formatMessage({
        id: "add.cephPrimaryStoragePool",
        defaultMessage: "Add Storage Pool",
      })}
      resourceName={source?.name || ""}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="poolName"
            label={intl.formatMessage({
              id: "poolName",
              defaultMessage: "Pool UUID",
            })}
            required
            size="m"
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "cephStoragePool.field.poolName.tooltip",
                  defaultMessage: `### Pool UUID
Enter the UUID of the storage pool. If you add an existing storage pool, obtain its UUID in advance.`,
                })}
              </ReactMarkdown>
            }
          />
          <InputField
            form={form}
            name="aliasName"
            label={intl.formatMessage({
              id: "displayName",
              defaultMessage: "Display Name",
            })}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
