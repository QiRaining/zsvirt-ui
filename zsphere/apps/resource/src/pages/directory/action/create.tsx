import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Text } from "@zstack/design";
import { InputField } from "@zstack/form";
import {
  addGroup,
  vmSubDirGroupList,
} from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createDirectoryCreateSchema,
  type DirectoryCreateFormValues,
} from "./schema";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: any[];
}

const inputWidthStyle = { width: 320 } as const;

const CreateGroup: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const { uuid, groupName, zoneUuid } = selectedList?.[0] ?? {};
  const intl = useIntl();
  const doAction = useAction();

  const listSubDirectoryGroups = useCallback(
    async ({ dirUuid, zoneUuid }: { dirUuid?: string; zoneUuid?: string }) => {
      const res = await window.g_main.apolloClient.query({
        query: vmSubDirGroupList,
        variables: {
          conditions: [
            {
              key: "parentUuid",
              op: Op.eq,
              value: dirUuid,
            },
            { key: "zoneUuid", value: zoneUuid, op: Op.eq },
          ],
        },
      });

      return res?.data?.vmSubDirGroupList?.list ?? [];
    },
    [],
  );

  const formSchema = useMemo(
    () =>
      createDirectoryCreateSchema({
        intl,
        dirUuid: uuid,
        zoneUuid,
        listSubDirectoryGroups,
      }),
    [intl, listSubDirectoryGroups, uuid, zoneUuid],
  );

  const form = useForm<DirectoryCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const nameError = form.getFieldState("name").error;
          throw {
            errorFields: [
              {
                name: ["name"],
                errors: nameError?.message ? [nameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset({
          name: "",
        });
      },
    }),
    [form],
  );

  const onOk = async ({ name }: DirectoryCreateFormValues) => {
    doAction({
      mutation: addGroup,
      payload: {
        parentUuid: uuid === "-1" ? "" : uuid,
        name,
        type: "default",
        zoneUuid,
      },
      type: "DirectoryGroup",
      name: intl.formatMessage({
        id: "create.vm.group",
        defaultMessage: "Create Sub Group",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "create.sub.group",
        defaultMessage: "Create Sub Group",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        {uuid !== "-1" && (
          <div className="mb-4 flex flex-row gap-2">
            <div className="mt-[5px] flex h-min w-40 min-w-40 items-center text-sm text-neutral-600">
              {intl.formatMessage({
                id: "level",
                defaultMessage: "Affiliated to",
              })}
            </div>
            <Text style={inputWidthStyle}>{groupName}</Text>
          </div>
        )}
        <InputField
          form={form}
          name="name"
          label={intl.formatMessage({
            id: "name",
            defaultMessage: "Name",
          })}
          required
          style={inputWidthStyle}
        />
      </Form>
    </DialogForm>
  );
};

export default CreateGroup;
