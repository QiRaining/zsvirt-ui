import { gql } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ZSVForm, Switch, Form, Table } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { useDebounceFn } from "ahooks";
import { Input } from "antd";
import cls from "classnames";
import { difference as _difference } from "lodash-es";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useIntl } from "react-intl";
import { collectApis } from "zsv_administration_shared/role/utils";

import EditModal from "../components/EditModal";

import styles from "./style.module.less";

const STYLE_MARGIN_BOTTOM_4 = { marginBottom: 4 } as const;
const STYLE_INPUT_WIDTH_280 = { width: 280 } as const;

interface IEditResourceAuthProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: any[];
  source: any;
  title?: string;
}

interface DataItem {
  key: string;
  name: string;
  enabled: boolean;
  privilegeService: string;
  apiList?: any[];
}

const ApiEditIcon: React.FC<{
  record: DataItem;
  onEdit: (item: DataItem) => void;
}> = ({ record, onEdit }) => {
  const handleClick = useCallback(() => {
    onEdit(record);
  }, [onEdit, record]);

  return (
    <Icon
      type="edit"
      onClick={handleClick}
      className={cls(
        styles[record?.enabled ? "icon-enabled" : "icon-disabled"],
      )}
    />
  );
};

const ApiEnabledSwitch: React.FC<{
  enabled: boolean;
  record: DataItem;
  onToggle: (checked: boolean, record: DataItem) => void;
}> = ({ enabled, record, onToggle }) => {
  const handleChange = useCallback(
    (checked: boolean) => {
      onToggle(checked, record);
    },
    [onToggle, record],
  );

  return <Switch checked={enabled} onChange={handleChange} />;
};

const { Card } = ZSVForm;

const updateRoleApiConfig = gql`
  mutation updateRoleApiConfig($input: UpdateRoleApiConfigInput!) {
    updateRoleApiConfig(input: $input) {
      actionId
    }
  }
`;

const EditResourceAuth: React.FC<IEditResourceAuthProps> = ({
  visible,
  setVisible,
  selectedList,
  source,
  title,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const [currentKey, setCurrentKey] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editApiListInfo, setEditApiListInfo] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [enableButtonDisabled, setEnableButtonDisabled] = useState(true);
  const [disableButtonDisabled, setDisableButtonDisabled] = useState(true);
  const dataSourceRef = useRef<any[]>([]);

  useEffect(() => {
    if (visible && selectedList?.length > 0) {
      const newData = selectedList?.map((item) => ({
        key: item.key,
        name: item.name,
        enabled: !!item?.selectedAPINum,
        privilegeService: `${item?.selectedAPINum}/${
          Object.keys(item.api).length
        }`,
        apiList: Object.values(item.api).map((it: any) => {
          return {
            name: it.description,
            key: it.name,
            selected: it.selected ?? false, //todo: 这里的selected应该是从后端获取的
            api: it.api,
          };
        }),
      }));
      dataSourceRef.current = newData;
      setDataSource(newData);
    }
  }, [selectedList, visible]);

  const showModal = useCallback((item: DataItem) => {
    const { key, apiList, name } = item;
    setCurrentKey(key);
    setEditTitle(name);
    setEditApiListInfo(apiList ?? []);
    setIsModalVisible(true);
  }, []);

  const handleEditClick = useCallback(
    (record: DataItem) => {
      showModal(record);
    },
    [showModal],
  );

  const updateApiList = (list: any[]) => {
    const newData = dataSource.map((item) => {
      if (item.key === currentKey) {
        return {
          ...item,
          privilegeService: `${list.filter((it) => it.selected).length}/${
            item.apiList.length
          }`,
          apiList: list,
        };
      }
      return item;
    });

    setDataSource(newData);
  };

  const filterAndUpdateDataSource = useCallback((input: string) => {
    const sourceData = dataSourceRef.current;
    const filteredData = input
      ? sourceData.filter((item: { name: string }) =>
          item.name.toLowerCase().includes(input.toLowerCase()),
        )
      : sourceData;
    setDataSource(filteredData);
  }, []);

  const { run: debouncedFilterAndUpdate } = useDebounceFn(
    filterAndUpdateDataSource,
    {
      wait: 300,
    },
  );

  const handleInputChange = useCallback(
    (value: string) => {
      debouncedFilterAndUpdate(value);
    },
    [debouncedFilterAndUpdate],
  );

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(event.target.value);
    },
    [handleInputChange],
  );

  const handleBulkOperation = useCallback(
    (operation: "enable" | "disable") => {
      if (!selectedRowKeys.length) {
        return;
      }

      setDataSource((prevData) =>
        prevData.map((item) => {
          if (selectedRowKeys.includes(item.key)) {
            const newEnabled = operation === "enable";
            const updatedApiList = item.apiList.map((api: any) => ({
              ...api,
              selected: newEnabled,
            }));
            const selectedAPINum = newEnabled ? updatedApiList.length : 0;
            return {
              ...item,
              enabled: newEnabled,
              apiList: updatedApiList,
              privilegeService: `${selectedAPINum}/${updatedApiList.length}`,
            };
          }
          return item;
        }),
      );

      setSelectedRowKeys([]);
    },
    [selectedRowKeys],
  );

  const handleEnableAll = useCallback(
    () => handleBulkOperation("enable"),
    [handleBulkOperation],
  );
  const handleDisableAll = useCallback(
    () => handleBulkOperation("disable"),
    [handleBulkOperation],
  );

  useEffect(() => {
    if (selectedRowKeys.length === 0) {
      setEnableButtonDisabled(true);
      setDisableButtonDisabled(true);
    } else {
      const selectedItems = dataSource.filter((item) =>
        selectedRowKeys.includes(item.key),
      );
      const allEnabled = selectedItems.every((item) => item.enabled);
      const allDisabled = selectedItems.every((item) => !item.enabled);

      setEnableButtonDisabled(allEnabled);
      setDisableButtonDisabled(allDisabled);
    }
  }, [selectedRowKeys, dataSource]);

  const handleToggleEnabled = useCallback(
    (checked: boolean, record: DataItem) => {
      setDataSource((prevData) =>
        prevData.map((item) => {
          if (item.key === record.key) {
            const updatedApiList = item.apiList.map((apiItem: any) => ({
              ...apiItem,
              selected: checked,
            }));
            const selectedAPINum = checked ? updatedApiList.length : 0;
            return {
              ...item,
              enabled: checked,
              apiList: updatedApiList,
              privilegeService: `${selectedAPINum}/${updatedApiList.length}`,
            };
          }
          return item;
        }),
      );
    },
    [],
  );

  const columns = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        dataIndex: "name",
        key: "name",
        width: 147,
        render: (name: string) => {
          return <Text>{name}</Text>;
        },
      },
      {
        title: intl.formatMessage({
          id: "api.auth.status",
          defaultMessage: "Status",
        }),
        dataIndex: "enabled",
        key: "enabled",
        width: 147,
        render: (enabled: boolean, record: DataItem) => (
          <ApiEnabledSwitch
            enabled={enabled}
            record={record}
            onToggle={handleToggleEnabled}
          />
        ),
      },
      {
        title: intl.formatMessage({
          id: "privilegeService",
          defaultMessage: "Permissions",
        }),
        dataIndex: "privilegeService",
        width: 147,
        key: "privilegeService",
      },
      {
        title: intl.formatMessage({ id: "operation", defaultMessage: "Actions" }),
        key: "info",
        width: 51,
        render: (record: DataItem) => {
          return <ApiEditIcon record={record} onEdit={handleEditClick} />;
        },
      },
    ];
  }, [handleEditClick, handleToggleEnabled, intl]);

  const handleRowSelectionChange = useCallback((keys: React.Key[]) => {
    setSelectedRowKeys(keys as any);
  }, []);

  const rowSelection = {
    type: "checkbox" as any,
    selectedRowKeys,
    onChange: handleRowSelectionChange,
  };

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onFinish = () => {
    const { selectedApis } = collectApis(dataSource);
    const { selectedApis: selectedListApis } = collectApis(selectedList);

    doAction({
      mutation: updateRoleApiConfig,
      payload: {
        uuid: source.uuid,
        deletePolicies: _difference(selectedListApis, selectedApis),
        createPolicies: _difference(selectedApis, selectedListApis),
      },
      name: intl.formatMessage({
        id: "edit.resource.api.auth",
        defaultMessage: "Modify API Permissions",
      }),
      total: 1,
      type: "Role",
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <>
      <DialogForm
        form={form}
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage(
          {
            id: "virtualization.role.edit.api.title",
            defaultMessage: "Modify {title} API Permissions",
          },
          {
            title,
          },
        )}
        resourceName={source?.name}
        onCancel={handleCancel}
        onOk={onFinish}
      >
        <Form form={form}>
          <Card
            title={intl.formatMessage({
              id: "auth.api",
              defaultMessage: "API Permissions",
            })}
          >
            <div className={styles.container}>
              <div
                className="flex items-center gap-1"
                style={STYLE_MARGIN_BOTTOM_4}
              >
                <Button
                  onClick={handleEnableAll}
                  disabled={enableButtonDisabled}
                >
                  {intl.formatMessage({ id: "open", defaultMessage: "Enabled" })}
                </Button>
                <Button
                  onClick={handleDisableAll}
                  disabled={disableButtonDisabled}
                >
                  {intl.formatMessage({ id: "close", defaultMessage: "Disabled" })}
                </Button>
                <Input
                  placeholder={intl.formatMessage({
                    id: "search.name",
                    defaultMessage: "Search by name",
                  })}
                  onChange={handleSearchInputChange}
                  style={STYLE_INPUT_WIDTH_280}
                  suffix={<Icon type="search" />}
                />
              </div>
              <Table
                rowKey="key"
                className={styles["table-form"]}
                columns={columns}
                dataSource={dataSource}
                rowSelection={rowSelection}
                showClear={false}
                fixHeaderOnTop={false}
              />
            </div>
          </Card>
        </Form>
      </DialogForm>
      {isModalVisible && (
        <EditModal
          visible={isModalVisible}
          setVisible={setIsModalVisible}
          selectedList={editApiListInfo}
          setSelectedList={updateApiList}
          title={editTitle}
        />
      )}
    </>
  );
};

export default EditResourceAuth;
