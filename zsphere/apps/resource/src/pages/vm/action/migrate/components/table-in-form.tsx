import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Table } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const CONTROLS_CONTAINER_STYLE = {
  display: "flex",
  flexDirection: "row",
} as const;
const INPUT_SEARCH_STYLE = { marginLeft: 4, width: 320 } as const;

interface ColumeItem {
  title: string | React.ReactNode;
  key: string;
  width: number;
  render: any;
}

export interface ZProps {
  dataSource: any[];
  columns: ColumeItem[];
  batchConfigDisable?: boolean;
  setBatchConfigModalVisible?: any;
  inputSearch?: any;
  rowKey?: string;
  selectedRowKeys: string[];
  rowSelection: any;
  showBatchBtn?: boolean;
}

const TableInForm: React.FC<ZProps> = (props) => {
  const intl = useIntl();
  const {
    dataSource,
    columns,
    inputSearch,
    selectedRowKeys,
    rowSelection,
    setBatchConfigModalVisible,
    rowKey = "uuid",
  } = props;

  const handleBatchConfigClick = () => {
    if (selectedRowKeys.length > 0) {
      setBatchConfigModalVisible(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputSearch(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div style={CONTROLS_CONTAINER_STYLE}>
        <Button
          icon={<Icon type="edit" />}
          disabled={selectedRowKeys.length === 0}
          onClick={handleBatchConfigClick}
        >
          {intl.formatMessage({
            id: "batch.config",
            defaultMessage: "Batch Configuration",
          })}
        </Button>
        <Input
          placeholder={intl.formatMessage({
            id: "search",
            defaultMessage: "Search",
          })}
          allowClear
          onChange={handleInputChange}
          width={320}
          style={INPUT_SEARCH_STYLE}
          suffix={<Icon type="search" />}
        />
      </div>
      <Table
        className={styles[`batch-table-form`]}
        fixHeaderOnTop={false}
        dataSource={dataSource}
        rowKey={rowKey}
        showClear={false}
        selectedList={dataSource.filter((t) =>
          selectedRowKeys.includes(t.uuid),
        )}
        columns={columns}
        rowSelection={{ type: "checkbox", ...rowSelection }}
      />
    </div>
  );
};

export default TableInForm;
