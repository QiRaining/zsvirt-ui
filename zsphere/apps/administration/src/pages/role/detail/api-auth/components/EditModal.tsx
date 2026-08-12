import { Checkbox, Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useDebounceFn } from "ahooks";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";

import Empty from "../../../components/empty";

import styles from "./style.module.less";

const STYLE_INPUT_MARGIN_BOTTOM_18 = { marginBottom: 18 } as const;
const STYLE_CHECKBOX_GROUP_FULL_WIDTH = { width: "100%" } as const;
const STYLE_ROW_PADDING_LEFT_12 = { paddingLeft: 12, marginRight: 0 } as const;

interface ApiItem {
  name: string;
  selected: boolean;
  key: string;
}

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: ApiItem[];
  setSelectedList: (selectedList: ApiItem[]) => void;
  title: string;
}

const EditModal: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  title: _title,
}) => {
  const intl = useIntl();
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [list, setList] = useState<ApiItem[]>([]);

  useEffect(() => {
    const checkedList = selectedList
      .filter((item) => item.selected)
      .map((item) => item.name);
    setList(selectedList);
    setSelectAll(selectedList.length === checkedList.length);
  }, [selectedList]);

  const checkedApiList = useMemo(
    () => list.filter((item) => item.selected).map((item) => item.name),
    [list],
  );

  const onSelectAll = useCallback(() => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setList((prevList) =>
      prevList.map((item) => ({ ...item, selected: newSelectAll })),
    );
  }, [selectAll]);

  const onChangeCheckGroup = useCallback((checkedValue: string[]) => {
    setList((prevList) =>
      prevList.map((item) => ({
        ...item,
        selected: checkedValue.includes(item.name),
      })),
    );
  }, []);

  const { run: runSearch } = useDebounceFn(
    (inputVal: string) => {
      setSearchText(inputVal);
    },
    { wait: 200 },
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      runSearch(event.target.value);
    },
    [runSearch],
  );

  const showList = useMemo(() => {
    return searchText
      ? list.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()),
        )
      : list;
  }, [list, searchText]);

  const handleOk = useCallback(() => {
    setVisible(false);
    setSelectedList(list);
  }, [setVisible, setSelectedList, list]);

  const handleCancelClick = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "edit.auth.api",
        defaultMessage: "Modify API Permissions",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-[600px]"
      onCancel={handleCancelClick}
      footer={
        <>
          <Button variant="link" onClick={handleCancelClick}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={handleOk}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </>
      }
    >
      <div className={styles["modal-base-content"]}>
        <Input
          placeholder={intl.formatMessage({
            id: "search",
            defaultMessage: "Search",
          })}
          onChange={handleSearchChange}
          suffix={<Icon type="search" />}
          style={STYLE_INPUT_MARGIN_BOTTOM_18}
        />
        <div className={styles["api-list"]}>
          <div className={styles.title}>
            <div className="flex items-center">
              <Checkbox
                onCheckedChange={onSelectAll}
                checked={
                  checkedApiList.length > 0 &&
                  checkedApiList.length < list.length
                    ? "indeterminate"
                    : selectAll
                }
              />
              <span className="cursor-pointer pl-2 text-sm">
                {intl.formatMessage({
                  id: "auth.api",
                  defaultMessage: "API Permissions",
                })}
                <span>
                  ({checkedApiList.length}/{list.length})
                </span>
              </span>
            </div>
          </div>
          <Empty isSearching={!!searchText} dataSource={showList}>
            <div style={STYLE_CHECKBOX_GROUP_FULL_WIDTH}>
              <div
                className="flex gap-4 gap-y-3"
                style={STYLE_ROW_PADDING_LEFT_12}
              >
                {showList.map((item) => {
                  const itemId = `api-${item.key}`;
                  return (
                    <div className="w-[50%]" key={item.key}>
                      <Text>
                        <div className="flex items-center">
                          <Checkbox
                            id={itemId}
                            checked={checkedApiList.includes(item.name)}
                            onCheckedChange={(checked) => {
                              const newList = checked
                                ? [...checkedApiList, item.name]
                                : checkedApiList.filter((v) => v !== item.name);
                              onChangeCheckGroup(newList);
                            }}
                          />
                          <label
                            htmlFor={itemId}
                            className="cursor-pointer pl-2 text-sm"
                          >
                            <Text>{item.name}</Text>
                          </label>
                        </div>
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </Empty>
        </div>
      </div>
    </DialogBase>
  );
};

export default EditModal;
