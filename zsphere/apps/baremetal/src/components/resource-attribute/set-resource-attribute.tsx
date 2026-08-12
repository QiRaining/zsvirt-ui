import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  Alert,
  Form,
  Input,
  Modal,
  Table,
  useAuth,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import type {
  CreateResourceAttributeKeyPayload,
  UpdateResourceAttributeKeyPayload,
  CreateResourceAttributeValuePayload,
  DeleteResourceAttributeValuePayload,
  ResourceAttributeKey,
  ResourceAttributeKeyResponse,
  ResourceAttributeValueResponse,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName, genUuid } from "@zstack/zsphere-utils";
import cls from "classnames";
import { omit } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import ConstraintSelect from "./constraint-select";

import style from "./style.module.less";

const queryResourceAttributeKey = gql`
  query queryResourceAttributeKey($conditions: [Condition!]) {
    queryResourceAttributeKeyList(conditions: $conditions) {
      list {
        uuid
        name
        description
        resourceTypes
        constraints {
          id
          parameter
        }
        createDate
      }
    }
  }
`;

const queryResourceAttributeValue = gql`
  query queryResourceAttributeValue($conditions: [Condition!]) {
    queryResourceAttributeValueList(conditions: $conditions) {
      list {
        keyUuid
        value
        resourceUuid
        resourceName
        resourceType
        createDate
      }
    }
  }
`;

const setResourceAttributeValue = gql`
  mutation setResourceAttributeValue($input: SetResourceAttributeValueInput!) {
    setResourceAttributeValue(input: $input) {
      actionId
    }
  }
`;

interface Datasource {
  key: string;
  resourceAttributeKey?: ResourceAttributeKey;
}

interface AttributeInput {
  [keyUuid: string]: {
    key?: string;
    value?: string;
  };
}

export default function SetResourceAttribute({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}: IActionWrapperProps<any>) {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { isRequired, lengthRange, validatorUniqName, isValidNameString } =
    useValidator(intl);
  const [datasource, setDatasource] = useState<Datasource[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const initialValue = useRef<AttributeInput | null>(null);
  const [form] = Form.useForm();
  const doAction = useAction();

  const resourceType = selectedList[0]?.__typename?.endsWith("VO")
    ? selectedList[0].__typename
    : `${selectedList[0]?.__typename}VO`;

  const filteredDatasource = useMemo(() => {
    if (!searchValue) {
      return datasource;
    }
    return datasource.filter((item) =>
      item.resourceAttributeKey?.name
        .toLowerCase()
        .includes(searchValue.toLowerCase()),
    );
  }, [datasource, searchValue]);

  const [queryKey] = useLazyQuery<{
    queryResourceAttributeKeyList?: ResourceAttributeKeyResponse;
  }>(queryResourceAttributeKey, {
    variables: {
      conditions: [
        {
          key: "resourceType",
          op: Op.in,
          values: ["ResourceAttributeKeyVO", resourceType],
        },
      ],
    },
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const list = data?.queryResourceAttributeKeyList?.list;
      if (list?.length) {
        setDatasource(
          list.map((item) => ({ key: item.uuid, resourceAttributeKey: item })),
        );
      }
    },
  });

  const [queryValue] = useLazyQuery<{
    queryResourceAttributeValueList?: ResourceAttributeValueResponse;
  }>(queryResourceAttributeValue, {
    variables: {
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: selectedList?.[0]?.uuid ?? "",
        },
      ],
    },
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const list = data?.queryResourceAttributeValueList?.list;
      if (list?.length) {
        const attributes: AttributeInput = {};
        list.forEach(({ keyUuid, value }) => {
          attributes[keyUuid] = { value };
        });
        initialValue.current = attributes;
        form.setFieldsValue({ attributes });
      }
    },
  });

  useEffect(() => {
    if (visible) {
      initialValue.current = null;
      setDatasource([]);
      setSearchValue("");
      form.resetFields();
      queryKey();
      if (selectedList.length === 1) {
        queryValue();
      }
    }
  }, [visible, form, queryKey, queryValue, selectedList.length]);

  const onOk = async () => {
    const attributes = form.getFieldValue("attributes") as AttributeInput;
    if (!attributes || !datasource.length) {
      throw new Error("no data");
    }

    const resourceUuids = selectedList.map((item) => item.uuid);
    const createResourceAttributeKeyPayload: CreateResourceAttributeKeyPayload[] =
      [];
    const updateResourceAttributeKeyPayload: UpdateResourceAttributeKeyPayload[] =
      [];
    const createResourceAttributeValuePayload: CreateResourceAttributeValuePayload[] =
      [];
    const deleteResourceAttributeValuePayload: DeleteResourceAttributeValuePayload[] =
      [];

    datasource.forEach(({ key: keyUuid, resourceAttributeKey }) => {
      const userInput = attributes[keyUuid] ?? {};
      if (resourceAttributeKey) {
        const updatePayload: UpdateResourceAttributeKeyPayload = {
          uuid: keyUuid,
        };
        if (!resourceAttributeKey.resourceTypes?.includes(resourceType)) {
          updatePayload.resourceTypes = [
            ...(resourceAttributeKey.resourceTypes ?? []),
            resourceType,
          ];
        }
        const oldValue = initialValue.current?.[keyUuid]?.value;
        if (oldValue && !userInput.value) {
          deleteResourceAttributeValuePayload.push({ keyUuid, resourceUuids });
        } else if (userInput.value && userInput.value !== oldValue) {
          createResourceAttributeValuePayload.push({
            value: userInput.value,
            keyUuid,
            resourceUuids,
          });
          if (
            !resourceAttributeKey.constraints?.find(
              ({ parameter }) => userInput.value === parameter,
            )
          ) {
            updatePayload.createConstraints = [
              { parameter: userInput.value, type: "enum" },
            ];
          }
        }
        if (updatePayload.createConstraints || updatePayload.resourceTypes) {
          updateResourceAttributeKeyPayload.push(updatePayload);
        }
      } else if (userInput.key) {
        const createPayload: CreateResourceAttributeKeyPayload = {
          resourceUuid: keyUuid,
          name: userInput.key,
          resourceTypes: [resourceType],
        };
        createResourceAttributeKeyPayload.push(createPayload);
        if (userInput.value) {
          createPayload.constraints = [
            { parameter: userInput.value, type: "enum" },
          ];
          createResourceAttributeValuePayload.push({
            value: userInput.value,
            keyUuid,
            resourceUuids,
          });
        }
      }
    });

    if (
      !createResourceAttributeKeyPayload.length &&
      !updateResourceAttributeKeyPayload.length &&
      !createResourceAttributeValuePayload.length &&
      !deleteResourceAttributeValuePayload.length
    ) {
      throw new Error("no changes");
    }

    const payload = {
      createResourceAttributeKeyPayload,
      updateResourceAttributeKeyPayload,
      createResourceAttributeValuePayload,
      deleteResourceAttributeValuePayload,
    };

    doAction({
      mutation: setResourceAttributeValue,
      payload,
      name: intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "Set Custom Attribute",
      }),
      total: 1,
      type: "ResourceAttributeValue",
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  const columns = [
    {
      key: "key",
      title: (
        <Form.Item
          className={style.keyTitle}
          label={intl.formatMessage({
            id: "resource.attribute.key",
            defaultMessage: "Attribute Key",
          })}
          required
        />
      ),
      width: 100,
      render: (_row: any, record: Datasource) => {
        if (record.resourceAttributeKey) {
          return <Text>{record.resourceAttributeKey.name}</Text>;
        }
        return (
          <Form.Item
            name={["attributes", record.key, "key"]}
            rules={[
              isRequired(),
              isValidNameString(),
              lengthRange(1, 80),
              {
                validator: (_rule, value?: string) => {
                  if (!value || !datasource.length) {
                    return Promise.resolve();
                  }
                  if (
                    datasource.some(
                      (item) =>
                        item.key !== record.key &&
                        (item.resourceAttributeKey
                          ? item.resourceAttributeKey.name === value
                          : form.getFieldValue([
                              "attributes",
                              item.key,
                              "key",
                            ]) === value),
                    )
                  ) {
                    return Promise.reject(
                      new Error(
                        intl.formatMessage({
                          id: "resource.attribute.key.validator.duplicate",
                          defaultMessage: "Duplicated attribute key.",
                        }),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
              validatorUniqName(
                ResourceQueryType.ResourceAttributeKey,
                undefined,
                intl.formatMessage({
                  id: "resource.attribute.key.validator.duplicate",
                  defaultMessage: "Duplicated attribute key.",
                }),
                true,
              ),
            ]}
          >
            <Input autoFocus />
          </Form.Item>
        );
      },
    },
    {
      key: "value",
      title: intl.formatMessage({
        id: "resource.attribute.value",
        defaultMessage: "Attribute Value",
      }),
      width: 100,
      render: (_row: any, record: Datasource) => {
        return (
          <Form.Item
            name={["attributes", record.key, "value"]}
            rules={[isValidNameString(), lengthRange(1, 80)]}
          >
            <ConstraintSelect
              constraints={record.resourceAttributeKey?.constraints}
              disableCreation={
                !hasAuth({
                  type: "action",
                  resource: "resource.attribute.constraint",
                  authKey: "create",
                })
              }
            />
          </Form.Item>
        );
      },
    },
    {
      key: "actions",
      title: intl.formatMessage({ id: "action", defaultMessage: "Actions" }),
      width: 52,
      align: "center" as const,
      fixed: "right" as const,
      render: (_row: any, record: Datasource) => {
        const disabled = !!record.resourceAttributeKey;
        return (
          <div
            role="button"
            tabIndex={0}
            className={cls(style.trash, { [style.disabled]: disabled })}
            onClick={() => {
              if (!disabled) {
                setDatasource(
                  datasource.filter((item) => item.key !== record.key),
                );
                const attributes = form.getFieldValue("attributes");
                form.setFieldsValue(omit(attributes, record.key));
              }
            }}
          >
            <Icon type="trash" />
          </div>
        );
      },
    },
  ];

  return (
    <DialogForm
      widthClassName="w-150"
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "set.resource.attribute",
        defaultMessage: "Set Custom Attribute",
      })}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form}>
        {selectedList.length > 1 && (
          <div className={style.alert}>
            <Alert
              type="warning"
              display="blockStrong"
              message={intl.formatMessage({
                id: "set.resource.attribute.value.modal.alert",
                defaultMessage:
                  "Batch configuration will overwrite the corresponding attribute values for all selected resources. If left blank, each resource's existing attribute values will be preserved.",
              })}
            />
          </div>
        )}
        <div className={style.toolbar}>
          {hasAuth({
            type: "action",
            resource: "resource.attribute.key",
            authKey: "create",
          }) && (
            <Button
              icon={<Icon type="plus" />}
              onClick={() => {
                setDatasource([...datasource, { key: genUuid() }]);
              }}
            >
              {intl.formatMessage({ id: "add", defaultMessage: "Add" })}
            </Button>
          )}
          <Input
            className="width-320"
            placeholder={intl.formatMessage({
              id: "search",
              defaultMessage: "Search",
            })}
            suffix={<Icon type="search" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className={style.table}>
          <Table columns={columns} dataSource={filteredDatasource} />
        </div>
      </Form>
    </DialogForm>
  );
}
