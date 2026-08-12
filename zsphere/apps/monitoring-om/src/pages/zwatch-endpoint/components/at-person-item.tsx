import { Icon } from "@zstack/icon";
import {
  Form,
  Input,
  ListCollect,
  Select,
  Table,
} from "@zstack/zsphere-components";
import type { FormInstance } from "antd";
import cls from "classnames";
import type { FieldData } from "rc-field-form/es/interface";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import AreaCodePhoneNumberInput from "./area-code-phone-number";
import FormListWithRequired from "./form-list-with-required";

import style from "./style.module.less";

type PropsType = {
  form: FormInstance;
  /** 自定义表单项上一级的name，因为该组件内部 Item 的 name 是一个数组写法 */
  parentFieldName: string;
  onChangeObject?: (value: AtPersonType) => void;
  /** 支持的添加的成员类型是用户ID 还是 手机号，默认是用户ID */
  supportAtType?: "userId" | "phoneNumber";
};

export type AtPersonType = "none" | "atAll" | "atPerson";

const { Item } = Form;

export const AtPersonFormItems = ({
  form,
  parentFieldName,
  onChangeObject,
  supportAtType = "userId",
}: PropsType) => {
  const intl = useIntl();
  const isAtPerson = form.getFieldValue(parentFieldName)?.object === "atPerson";

  const [addPersonVisible, setAddPersonVisible] = React.useState(isAtPerson);

  const objectOptions: { value: AtPersonType; name: string }[] = [
    {
      value: "none",
      name: intl.formatMessage({
        id: "zwatch.endpoint.no_specify",
        defaultMessage: "@Nobody",
      }),
    },
    {
      value: "atAll",
      name: intl.formatMessage({
        id: "zwatch.endpoint.atAll",
        defaultMessage: "@All",
      }),
    },
    {
      value: "atPerson",
      name: intl.formatMessage({
        id: "zwatch.endpoint.atPerson",
        defaultMessage: "@Specified Member",
      }),
    },
  ];

  const handleChangeObject = (value: AtPersonType) => {
    onChangeObject?.(value);

    if (value === "atPerson") {
      setAddPersonVisible(true);
    } else {
      setAddPersonVisible(false);
    }
  };

  return (
    <>
      <Item
        name={[parentFieldName, "object"]}
        label={intl.formatMessage({
          id: "zwatch.endpoint.notify_member",
          defaultMessage: "Mention Member",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zwatch.endpoint.field.notify_member.tooltip",
              defaultMessage: `### Mention Member
A DingTalk, Lark, or WeCom endpoint sends alarm messages to the 3rd-party platform through a group robot. The group robot can use an "@" symbol to mention group members who need to pay attention to the messages.

1.  @Nobody: When an alarm is triggered, the robot only sends an alarm message to the group without @ anyone.

2. @All: When an alarm is triggered, the robot sends an alarm message to the group and @ all group members to pay attention to it.
3. @Specified Members: When an alarm is triggered, the robot sends an alarm message to the group and @ the specified members to pay attention to it.`,
            })}
          </ReactMarkdown>
        }
        rules={[
          {
            validator(__, value: string) {
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.object.validator.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select<AtPersonType>
          width="s"
          onChange={(value) => {
            handleChangeObject(value);
          }}
        >
          {objectOptions.map(({ value, name }) => {
            return (
              <Select.Option value={value} key={value}>
                {name}
              </Select.Option>
            );
          })}
        </Select>
      </Item>
      {addPersonVisible && (
        <AddPersonItem
          form={form}
          parentFieldName={parentFieldName}
          supportAtType={supportAtType}
        />
      )}
    </>
  );
};

export const AddPersonItem = ({
  form,
  parentFieldName,
  supportAtType = "userId",
}: Pick<PropsType, "form" | "parentFieldName" | "supportAtType">) => {
  const intl = useIntl();

  const columns = React.useMemo(() => {
    switch (supportAtType) {
      case "userId":
        return [
          {
            title: (
              <Form.Item
                required
                label={intl.formatMessage({
                  id: "userId",
                  defaultMessage: "User ID",
                })}
              />
            ),
            key: "phoneNumber",
            width: "45%",
            render: (_: any, field: FieldData) => {
              return <UserIdItem field={field} />;
            },
          },
          {
            title: intl.formatMessage({ id: "remark", defaultMessage: "Remark" }),
            key: "remark",
            width: "45%",
            render: (_: any, field: FieldData) => {
              return <RemarkItem field={field} />;
            },
          },
        ];
      case "phoneNumber":
        return [
          {
            title: (
              <Form.Item
                required
                label={intl.formatMessage({
                  id: "phone.number",
                  defaultMessage: "Mobile Phone",
                })}
              />
            ),
            key: "phoneNumber",
            width: "45%",
            render: (_: any, field: FieldData) => {
              return <PhoneNumberItem field={field} form={form} />;
            },
          },
          {
            title: intl.formatMessage({ id: "remark", defaultMessage: "Remark" }),
            key: "remark",
            width: "45%",
            render: (_: any, field: FieldData) => {
              return <RemarkItem field={field} />;
            },
          },
        ];
      default:
        return [];
    }
  }, [supportAtType]);

  const newPersonInfo = React.useMemo(() => {
    if (supportAtType === "userId") {
      return { userId: "", remark: "" };
    }

    return { phoneNumber: "", areaCode: "86", remark: "" };
  }, [supportAtType]);

  return (
    <Item
      required
      label={intl.formatMessage({
        id: "specifyMember",
        defaultMessage: "Specify Member",
      })}
      className={style.addAtPersonItem}
    >
      <FormListWithRequired
        form={form}
        name={[parentFieldName, "atPersonList"]}
        required
        message={intl.formatMessage({
          id: "zwatchEndpoint.field.add.specifyMember.validator.required",
          defaultMessage: "Add Member",
        })}
      >
        {(fields, { add, remove }) => {
          return (
            <TableSelect
              dataSource={fields}
              columns={columns}
              add={() => add(newPersonInfo)}
              remove={remove}
            />
          );
        }}
      </FormListWithRequired>
    </Item>
  );
};

const UserIdItem = ({ field }: { field: FieldData }) => {
  const intl = useIntl();

  return (
    <Form.Item
      className={style.atPersonInfoItem}
      required
      {...field}
      name={[field.name as string, "userId"]}
      rules={[
        {
          validator(__, value) {
            if (value.length <= 64 && value.length >= 1) {
              return Promise.resolve();
            }

            if (!value) {
              return Promise.reject(
                intl.formatMessage({
                  id: "zwatchEndpoint.field.user_id.validator.required",
                  defaultMessage: "Please enter user ID.",
                }),
              );
            }

            return Promise.reject(
              intl.formatMessage({
                id: "userId.validator.succeed_max_limit",
                defaultMessage: "The ID must be 1-64 characters in length.",
              }),
            );
          },
        },
      ]}
    >
      <Input className={style["width-240"]} />
    </Form.Item>
  );
};

const PhoneNumberItem = ({
  field,
  form,
}: {
  field: FieldData;
  form: FormInstance;
}) => {
  return (
    <Form.Item required className={style.atPersonInfoItem} {...field}>
      <AreaCodePhoneNumberInput form={form} fieldName={field.name as string} />
    </Form.Item>
  );
};

const RemarkItem = ({ field }: { field: FieldData }) => {
  const intl = useIntl();

  return (
    <Form.Item
      className={style.atPersonInfoItem}
      {...field}
      name={[field.name as string, "remark"]}
      rules={[
        {
          validator(__, value) {
            if (value.length <= 64 && value.length >= 0) {
              return Promise.resolve();
            }

            return Promise.reject(
              intl.formatMessage({
                id: "userId.validator.succeed_max_limit",
                defaultMessage: "The ID must be 1-64 characters in length.",
              }),
            );
          },
        },
      ]}
    >
      <Input className={style["width-240"]} />
    </Form.Item>
  );
};

export const AddSmsAtPersonFormItems = ({ form }: { form: FormInstance }) => {
  const intl = useIntl();
  return (
    <Item
      required
      label={intl.formatMessage({
        id: "smsAddress",
        defaultMessage: "SMS Address",
      })}
      className={style.addAtPersonItem}
    >
      <FormListWithRequired
        form={form}
        name={["addAliyunSms", "atPersonList"]}
        required
        message={intl.formatMessage({
          id: "zwatchEndpoint.field.add.smsAddress.validator.required",
          defaultMessage: "Add SMS address.",
        })}
      >
        {(fields, { add, remove }) => {
          return (
            <ListCollect
              style={{ display: "contents" }}
              addable={
                form.getFieldValue("addAliyunSms")?.atPersonList?.length < 200
              }
              className={style["sms-address"]}
              label={intl.formatMessage(
                {
                  id: "add.sms.{count}/200)",
                  defaultMessage: "Add SMS Address ({count}/100)",
                },
                {
                  count:
                    form.getFieldValue("addAliyunSms")?.atPersonList?.length ||
                    0,
                },
              )}
              dataSource={fields}
              add={() => add({ phoneNumber: "", areaCode: "86" })}
              remove={remove}
              layout="normal"
            >
              {(field) => <PhoneNumberItem field={field} form={form} />}
            </ListCollect>
          );
        }}
      </FormListWithRequired>
    </Item>
  );
};

interface TableSelectProps {
  dataSource: any[];
  add: () => void;
  remove: (index: number) => void;
  columns: any[];
  label?: string;
  className?: string;
  addable?: boolean;
}

const TableSelect: React.FC<TableSelectProps> = ({
  dataSource,
  columns,
  add,
  remove,
  label,
  addable = true,
}) => {
  const intl = useIntl();
  label =
    label ??
    intl.formatMessage({
      id: "user.modal.title.confirm.add.member",
      defaultMessage: "Add User",
    });
  if (!columns.some((item) => item.key === "handle")) {
    columns.push({
      title: "操作",
      key: "handle",
      width: "10%",
      render: (_: any, record: any, index: number) => {
        return (
          <div className={style.trash} onClick={() => remove(index)}>
            <Icon type="trash" />
          </div>
        );
      },
    });
  }
  return (
    <div className={style.tableSelect}>
      {dataSource.length > 0 ? (
        <Table dataSource={dataSource} columns={columns} />
      ) : null}
      <div
        className={cls(style.add, {
          [style.disabledAdd]: !addable,
        })}
        onClick={() => addable && add()}
      >
        <Icon type="plus" />
        {label}
      </div>
    </div>
  );
};
