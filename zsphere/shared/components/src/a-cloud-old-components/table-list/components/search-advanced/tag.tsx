import { bus } from "@zstack/zsphere-utils";
import { useUpdateEffect } from "ahooks";
import { Button } from "antd";
import React, {
  FC,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../../_utils/common";
import { SearchContext } from "./context";
import Dropdown from "./dropdown";
import { ITag, IOption, ICandidate, IDropdownRef } from "./type";

const TagButton: FC<ITag> = ({ candidates, onOk }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<ICandidate>(
    candidates[0],
  );
  const { searchId } = useContext(SearchContext);
  const intl = useIntl();
  const dropdownRef = useRef<IDropdownRef>(null);

  const { key, label, searchKey, type, onSearch, ...otherProps } =
    selectedCandidate;

  useEffect(() => {
    bus.addListener(`${searchId}-tag-clear`, () => {
      dropdownRef.current?.clear?.();
    });
    return () => {
      bus.removeListener(`${searchId}-tag-clear`);
    };
  }, [dropdownRef, searchId]);

  const showTabs = candidates.length > 1;

  const tabs = candidates.map((item) => ({
    key: item.key,
    label: item.label,
  }));

  const name = useMemo(
    () => ({
      key,
      label,
      searchKey,
      type,
    }),
    [key, label, searchKey, type],
  );

  const handleTabChange = (value: string) => {
    const _selectedCandidate = candidates.find((item) => item.key === value)!;
    setSelectedCandidate(_selectedCandidate);
  };

  const handleDropdownOk = useCallback(
    (values: IOption[]) => {
      onOk?.(name, values);
    },
    [name],
  );

  const handleVisibleChange = (visible: boolean) => {
    if (visible) {
      dropdownRef.current?.refresh?.();
    }
  };

  useEffect(() => {
    const _selectedCandidate = candidates.find(
      (item) => item.key === selectedCandidate.key,
    )!;
    setSelectedCandidate(_selectedCandidate);
  }, [candidates]);

  useUpdateEffect(() => {
    dropdownRef.current?.refresh?.();
  }, [key]);

  return (
    <Dropdown
      {...otherProps}
      type={type}
      showScroll
      showSearch
      onSearch={onSearch}
      onOk={handleDropdownOk}
      overlayClassName={getBaseCls("search-tag-overlay")}
      showTabs={showTabs}
      tabs={tabs}
      onTabChange={handleTabChange}
      ref={dropdownRef}
      onOpenChange={handleVisibleChange}
    >
      <Button className={getBaseCls("search-tag-btn")}>
        {intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
      </Button>
    </Dropdown>
  );
};

export default TagButton;
