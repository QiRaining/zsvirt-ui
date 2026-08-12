import { Table } from "@zstack/zsphere-components";
import type { RowSelectionType } from "antd/es/table/interface";
import type { FC } from "react";

import styles from "./style.module.less";

interface IProps {
  selectionType?: string;
  dataSource: any;
  columns: any;
  setSelectedRowKeys: Function;
  selectedRowKeys: any;
}

const SelectTable: FC<IProps> = ({
  selectionType = "checkbox",
  dataSource,
  columns,
  ...props
}) => {
  // 处理已卸载置灰
  const getCheckboxProps = (record: any) => {
    return {
      disabled: record.location === "uninstalled",
    };
  };

  // 选中项
  const onSelectChange = (newSelectedRowKeys: any) => {
    props.setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    type: selectionType as RowSelectionType,
    selectedRowKeys: props.selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps,
  };

  return (
    <Table
      rowKey="key"
      className={styles.table}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      rowSelection={{
        ...rowSelection,
      }}
    />
  );
};

export default SelectTable;
