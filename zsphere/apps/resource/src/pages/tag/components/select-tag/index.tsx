import { useQuery } from "@apollo/client";
import {
  Checkbox,
  Tag,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import { queryTagList } from "@zstack/virtualization-resource/src/gql/tag.gql";
import { Empty, Input } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import type { Tag as ITag, TagQueryResp } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { isEmpty } from "lodash-es";
import VirtualList from "rc-virtual-list";
import type { ForwardRefRenderFunction } from "react";
import React, {
  useMemo,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useReducer,
} from "react";
import { useIntl } from "react-intl";

import CreateTags from "../../action/create-tag";

import styles from "./style.module.less";

const EMPTY_LIST: never[] = [];

interface IProps<T> {
  value?: T[];
  onChange?: (tags: T[]) => void;
  defaultQuery?: IQuery;
  className?: string;
}

interface IDropdownListItem {
  option: ITag;
  selectedOptions?: ITag[];
  onSelect?: (option: ITag) => void;
  className?: string;
}

const DropdownListItem: ForwardRefRenderFunction<
  HTMLDivElement,
  IDropdownListItem
> = (props, ref) => {
  const { option, selectedOptions, onSelect } = props;
  const _intl = useIntl();

  const handleSelect = () => {
    onSelect?.(option);
  };

  const renderOption = () => {
    const { uuid, name, color, resourceCount } = option;
    const checked = selectedOptions?.some((item) => item.uuid === uuid);

    return (
      <div className="flex flex-nowrap items-center gap-2">
        <div style={{ flex: "none" }}>
          <Checkbox checked={checked} />
        </div>
        <div style={{ flex: "auto" }}>
          <div className="flex flex-nowrap justify-between gap-1">
            <div>
              {color ? (
                <Tag
                  color={color}
                  className={styles["search-dropdown-list-item-tag"]}
                >
                  {name}
                </Tag>
              ) : (
                name
              )}
            </div>
            <div>{resourceCount}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={styles["search-dropdown-list-item"]}
      onClick={handleSelect}
    >
      {renderOption()}
    </div>
  );
};

const FowwardDropdownListItem = forwardRef(DropdownListItem);

const SelectWithLoader: React.FC<IProps<ITag>> = ({
  value,
  onChange,
  defaultQuery,
  className,
}) => {
  const intl = useIntl();

  const [searchKey, setSearchKey] = useState<string>();
  const [visible, setVisible] = useState<boolean>(false);
  const [createVisible, setCreateVisible] = useState<boolean>(false);

  const dp = useMemo(() => {
    return {
      ...defaultQuery,
      conditions: [...(defaultQuery?.conditions ?? [])],
    };
  }, [defaultQuery]);

  const { data, loading, refetch } = useQuery<{
    tagList: TagQueryResp;
  }>(queryTagList, {
    variables: dp,
    notifyOnNetworkStatusChange: true,
  });

  // 是否updateSelectedTags，用于选择新创建的tag
  const [key, updateKey] = useReducer((x) => x + 1, 0);
  const tagListUuidsRef = useRef<string[]>([]);

  const tagList = useMemo(() => {
    const _tagList = data?.tagList?.list ?? [];

    if (key === 0) {
      tagListUuidsRef.current = _tagList.map((it) => it.uuid);
    }

    return _tagList;
  }, [data, key]);

  const updateSelectedTagsWhenCreateNewTag = usePersistFn(() => {
    const differenceTagList = tagList.filter(
      (it) => !tagListUuidsRef.current.includes(it.uuid),
    );
    tagListUuidsRef.current = tagList.map((it) => it.uuid);

    if (!isEmpty(differenceTagList)) {
      onChange?.((value ?? []).concat(differenceTagList));
    }
  });

  useActionSubscribe({
    resourceTypeList: ["Tag"],
    onFinish: () => {
      refetch?.();
      updateKey();
    },
  });

  useEffect(() => {
    if (key !== 0 && !loading) {
      updateSelectedTagsWhenCreateNewTag();
    }
  }, [key, loading, updateSelectedTagsWhenCreateNewTag]);

  const options = useMemo(() => {
    if (loading) {
      return [];
    }
    return searchKey
      ? tagList.filter(
          (tag: ITag) => (tag?.name?.indexOf(searchKey) ?? -1) > -1,
        )
      : tagList;
  }, [tagList, loading, searchKey]);

  const containerHeight = options.length > 9 ? 300 : undefined;

  const onSelect = (option: ITag) => {
    if (value?.find((tag) => tag.uuid === option.uuid)) {
      onChange?.(value.filter((tag) => tag.uuid !== option.uuid));
    } else {
      onChange?.((value ?? []).concat([option]));
    }
  };

  const selectDom = (
    <div className={styles["search-dropdown-list"]}>
      <div className={styles["search-container"]}>
        <Input
          value={searchKey}
          placeholder={intl.formatMessage({
            id: "search.tag",
            defaultMessage: "Search Tag",
          })}
          className={styles["search-dropdown-top-action-input"]}
          suffix={<Icon type="search" />}
          onChange={(e) => setSearchKey(e.target.value)}
          allowClear
        />
      </div>
      <div>
        {options?.length > 0 ? (
          <VirtualList data={options} height={containerHeight} itemKey="key">
            {(item, _index) => (
              <>
                <FowwardDropdownListItem
                  option={item}
                  selectedOptions={value}
                  onSelect={onSelect}
                />
              </>
            )}
          </VirtualList>
        ) : (
          <Empty type="Select" />
        )}
      </div>
      <div className={styles["bottom-container"]}>
        <span
          className={value?.length ? styles["reset"] : styles["reset-disable"]}
          onClick={() => {
            value = [];
            onChange?.([]);
          }}
        >
          {intl.formatMessage({
            id: "reset",
            defaultMessage: "Reset",
          })}
        </span>
        <span
          onClick={() => {
            setCreateVisible(true);
            setVisible(false);
          }}
          className={styles["add-new-tag"]}
        >
          +{" "}
          {intl.formatMessage({ id: "create.tag", defaultMessage: "New Tag" })}
        </span>
      </div>
    </div>
  );

  const selectedTags = useMemo(() => {
    return value?.map((tag) => (
      <Tag
        key={tag.uuid}
        color={tag?.color}
        className={styles["search-dropdown-list-item-tag"]}
        closable
        onClose={() => onSelect(tag)}
      >
        {tag.name}
      </Tag>
    ));
  }, [value]);

  return (
    <>
      <Popover open={visible} onOpenChange={setVisible}>
        <PopoverTrigger asChild>
          <div
            className={`${styles["tag-container"]} ${className ?? ""}`}
            tabIndex={-1}
          >
            <div className="flex flex-wrap items-center gap-1">
              {selectedTags}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          open={visible}
        >
          {selectDom}
        </PopoverContent>
      </Popover>
      <CreateTags
        view=""
        selectedList={EMPTY_LIST}
        position="header"
        visible={createVisible}
        setVisible={setCreateVisible}
        showCreate={false}
      />
    </>
  );
};

export default SelectWithLoader;
