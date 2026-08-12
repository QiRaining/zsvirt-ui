import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Text,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  InputNumberField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { Icon } from "@zstack/icon";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";
import { Table } from "antd";
import { omit as _omit } from "lodash-es";
import React, { useCallback, useMemo } from "react";
import {
  useForm,
  useFieldArray,
  type FieldArray,
  type FieldArrayPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createSnmpTrapItemSchema,
  createSnmpTrapReceiverSchema,
  type CreateSnmpTrapReceiverFormValues,
  type SnmpTrapListFormValues,
  type SnmpTrapItemFormValues,
} from "./schema";

import style from "./style.module.less";

const createSnmpTrapReceiver = gql`
  mutation createSnmpTrapReceiver($input: CreateSnmpTrapReceiverInput!) {
    createSnmpTrapReceiver(input: $input) {
      actionId
    }
  }
`;

const STYLE_MARGIN_RIGHT_4 = { marginRight: 4 } as const;

export interface ISnmpTrapProtity extends SnmpTrapItemFormValues {
  idx?: number;
  fieldId?: string;
  uuid?: string;
}

const SnmpTrapProtityFormItem: React.FC<{
  form: UseFormReturn<SnmpTrapItemFormValues>;
}> = ({ form }) => {
  const intl = useIntl();

  return (
    <FieldStack>
      <InputField
        form={form}
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        required
        size="m"
      />

      <InputField
        form={form}
        name="snmpAddress"
        label={intl.formatMessage({
          id: "ip.address",
          defaultMessage: "IP Address",
        })}
        required
        size="m"
      />

      <InputNumberField
        form={form}
        name="snmpPort"
        label={intl.formatMessage({ id: "port", defaultMessage: "Port" })}
        required
        className="w-40"
        valueMode="string"
      />
    </FieldStack>
  );
};

export const SnmpTrapProtityModel: React.FC<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (values: ISnmpTrapProtity) => void;
  selectedList: Array<ISnmpTrapProtity>;
  setSelectList: (selectedList: Array<ISnmpTrapProtity>) => void;
}> = ({ visible, setVisible, onOk: _onOk, selectedList, setSelectList }) => {
  const intl = useIntl();

  const isEdit = selectedList.length > 0;
  const defaultValues = useMemo<SnmpTrapItemFormValues>(
    () => ({
      name: "",
      snmpAddress: "",
      snmpPort: 162,
      ...(isEdit ? _omit(selectedList[0], ["idx", "fieldId"]) : {}),
    }),
    [isEdit, selectedList],
  );
  const formSchema = useMemo(() => createSnmpTrapItemSchema(intl), [intl]);
  const form = useForm<SnmpTrapItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const title = isEdit
    ? intl.formatMessage({
        id: "edit.snmp.trap.modal.title",
        defaultMessage: "Modify Configuration",
      })
    : intl.formatMessage({
        id: "add.snmp.trap.modal.title",
        defaultMessage: "Add SNMP Trap Receiver",
      });

  const onOk = async (values: SnmpTrapItemFormValues) => {
    _onOk(values);
  };

  React.useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onCancel = () => {
    setVisible(false);
    setSelectList([]);
  };

  return (
    <DialogForm
      title={title}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form {...form}>
        <SnmpTrapProtityFormItem form={form} />
      </Form>
    </DialogForm>
  );
};

export const SnmpTrapFormItem = <
  TFieldValues extends FieldValues & SnmpTrapListFormValues,
>({
  form,
  required,
}: {
  form: UseFormReturn<TFieldValues>;
  required?: boolean;
}): React.ReactNode => {
  const intl = useIntl();

  const [trapVisible, setTrapVisible] = React.useState<boolean>(false);
  const [selectedList, setSelectedList] = React.useState<
    Array<ISnmpTrapProtity>
  >([]);
  type TrapListPath = FieldArrayPath<TFieldValues>;
  const trapListName = "trapList" as TrapListPath;
  const { fields, append, update, remove } = useFieldArray<
    TFieldValues,
    TrapListPath,
    "fieldId"
  >({
    control: form.control,
    name: trapListName,
    keyName: "fieldId",
  });
  const toTrapListValue = React.useCallback(
    (data: ISnmpTrapProtity) =>
      _omit(data, ["idx", "fieldId"]) as FieldArray<TFieldValues, TrapListPath>,
    [],
  );
  const dataSource = React.useMemo<Array<ISnmpTrapProtity>>(
    () =>
      fields.map(
        (field, idx) =>
          ({
            ...field,
            idx,
          }) as ISnmpTrapProtity,
      ),
    [fields],
  );

  const handleAddTrapClick = useCallback(() => {
    setTrapVisible(true);
  }, []);

  const handleEditTrap = useCallback((row: ISnmpTrapProtity, idx: number) => {
    setTrapVisible(true);
    setSelectedList([{ ...row, idx }]);
  }, []);

  const handleDeleteTrap = useCallback(
    (idx: number) => {
      remove(idx);
    },
    [remove],
  );

  const handleEditTrapClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      event.stopPropagation();
      const indexValue = event.currentTarget.dataset.idx;

      if (indexValue === undefined) {
        return;
      }

      const index = Number(indexValue);
      const row = dataSource[index];

      if (!row) {
        return;
      }

      handleEditTrap(row, index);
    },
    [dataSource, handleEditTrap],
  );

  const handleDeleteTrapClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      event.stopPropagation();
      const indexValue = event.currentTarget.dataset.idx;

      if (indexValue === undefined) {
        return;
      }

      handleDeleteTrap(Number(indexValue));
    },
    [handleDeleteTrap],
  );

  const columns = React.useMemo(
    () => [
      {
        key: "name",
        dataIndex: "name",
        width: 157,
        title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        render: (value: React.ReactNode) => <Text>{value}</Text>,
      },
      {
        key: "snmpAddress",
        dataIndex: "snmpAddress",
        width: 157,
        title: intl.formatMessage({
          id: "ip.address",
          defaultMessage: "IP Address",
        }),
      },
      {
        key: "action",
        dataIndex: "action",
        width: 68,
        title: intl.formatMessage({ id: "action", defaultMessage: "Actions" }),
        render: (_: unknown, _row: ISnmpTrapProtity, idx: number) => {
          return (
            <div
              className={`flex items-center gap-3 ${style.action}`}
              wrap={false}
            >
              <Icon type="edit" data-idx={idx} onClick={handleEditTrapClick} />
              <Icon
                type="trash"
                data-idx={idx}
                onClick={handleDeleteTrapClick}
              />
            </div>
          );
        },
      },
    ],
    [handleDeleteTrapClick, handleEditTrapClick, intl],
  );

  const onOk = useCallback(
    async (data: ISnmpTrapProtity) => {
      if (selectedList.length > 0) {
        const idx = selectedList[0].idx;

        if (idx !== undefined) {
          update(idx, toTrapListValue(data));
        }
        setSelectedList([]);
      } else {
        append(toTrapListValue(data));
      }
    },
    [append, selectedList, toTrapListValue, update],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="trapList"
        render={() => (
          <FormItem className="flex flex-row gap-2">
            <FormLabel required={required} className="mt-[5px] flex">
              {intl.formatMessage({
                id: "snmp.trap.filed.snmpTraps",
                defaultMessage: "SNMP Trap Receiver",
              })}
            </FormLabel>
            <div className="flex flex-col">
              <FormControl>
                <div>
                  {dataSource.length ? (
                    <Table
                      tableLayout="fixed"
                      columns={columns}
                      dataSource={dataSource}
                      pagination={false}
                      className={style.table}
                    />
                  ) : null}

                  <Button
                    variant="link"
                    onClick={handleAddTrapClick}
                    className={style.addTrapBtn}
                    icon={<Icon type="plus" />}
                  >
                    {intl.formatMessage({
                      id: "add.snmpTrap",
                      defaultMessage: "Add SNMP Trap Receiver",
                    })}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <SnmpTrapProtityModel
        visible={trapVisible}
        setVisible={setTrapVisible}
        onOk={onOk}
        selectedList={selectedList}
        setSelectList={setSelectedList}
      />
    </>
  );
};

export interface IProps {}

const Create: React.FC<IActionWrapperProps<SnmpTrapReceiver> & IProps> = ({
  visible,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.snmpTrap.action.add.snmpTrap.title",
    defaultMessage: "Add SNMP Trap Receiver",
  });

  const defaultValues = useMemo<CreateSnmpTrapReceiverFormValues>(
    () => ({ trapList: [] }),
    [],
  );
  const formSchema = useMemo(() => createSnmpTrapReceiverSchema(intl), [intl]);
  const form = useForm<CreateSnmpTrapReceiverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: CreateSnmpTrapReceiverFormValues) => {
    const payload = values.trapList;

    doAction({
      mutation: createSnmpTrapReceiver,
      payload,
      name: title,
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      onOk={onOk}
      form={dialogForm}
      setVisible={setVisible}
      title={title}
    >
      <Form {...form}>
        <SnmpTrapFormItem form={form} required />
      </Form>
    </DialogForm>
  );
};

export default Create;
