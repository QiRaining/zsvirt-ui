import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useDebounceFn } from "ahooks";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import Empty from "../../components/empty";

import styles from "./style.module.less";

const STYLE_INPUT_MARGIN_BOTTOM_18 = { marginBottom: 18 } as const;
const STYLE_ROW_PADDING_LEFT_12 = { paddingLeft: 12, marginRight: 0 } as const;
const STYLE_COL_MARGIN_BOTTOM_12 = { marginBottom: 12 } as const;

interface IProps {
  visible: boolean;
  selectedList: any[];
  setVisible: (visible: boolean) => void;
  title?: string;
}

const Action: React.FC<IProps> = ({
  visible,
  selectedList,
  setVisible,
  title: _title,
}) => {
  const intl = useIntl();
  const [searchText, setSearchText] = useState<string>("");

  const { run: runSearch } = useDebounceFn(
    (inputVal: string) => {
      setSearchText(inputVal);
    },
    { wait: 200 },
  );

  const availbleApi = useMemo(() => {
    let result = selectedList.filter((item) => item?.selected);
    if (searchText) {
      result = result.filter(
        (item: any) =>
          item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1,
      );
    }
    return result;
  }, [selectedList, searchText]);

  const handleConfirmClick = useCallback(() => {
    setVisible(false);
    setSearchText("");
  }, [setSearchText, setVisible]);

  const handleCancel = useCallback(() => {
    setVisible(false);
    setSearchText("");
  }, [setSearchText, setVisible]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      runSearch(event.target.value);
    },
    [runSearch],
  );

  return (
    <DialogBase
      widthClassName="w-[600px]"
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "check.auth.api.title",
        defaultMessage: "View API Permissions",
      })}
      onCancel={handleCancel}
      footer={
        <Button variant="primary" onClick={handleConfirmClick}>
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
    >
      <div className={styles["api-modal"]}>
        <Input
          suffix={<Icon type="search" />}
          style={STYLE_INPUT_MARGIN_BOTTOM_18}
          onChange={handleSearchChange}
        />
        <div className={styles["api-list"]}>
          <div className={styles.title}>
            <div className={styles.rect} />
            {intl.formatMessage({ id: "auth.api", defaultMessage: "API Permissions" })}
            <span>
              ({availbleApi.length}/{selectedList.length})
            </span>
          </div>

          <Empty isSearching={!!searchText} dataSource={availbleApi}>
            <div
              className="flex flex-wrap gap-y-3"
              style={STYLE_ROW_PADDING_LEFT_12}
            >
              {availbleApi.map((item: any) => (
                <div
                  className="w-[50%]"
                  style={STYLE_COL_MARGIN_BOTTOM_12}
                  key={item.api}
                >
                  <Text>{item.name}</Text>
                </div>
              ))}
            </div>
          </Empty>
        </div>
      </div>
    </DialogBase>
  );
};

export default Action;
