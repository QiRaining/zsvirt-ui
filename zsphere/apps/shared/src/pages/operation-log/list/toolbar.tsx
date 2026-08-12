import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Search } from "@zstack/zsphere-components";
import type { IToolbarProps } from "@zstack/zsphere-types";
import type { OperationLog as IOperationLog } from "@zstack/zsphere-types/graphql";
import React, { useRef } from "react";
import { useIntl } from "react-intl";

import Action from "../action";

import style from "./style.module.less";

interface IProps extends IToolbarProps<IOperationLog> {
  onVisibleChange: (visible: boolean) => void;
}

const Toolbar: React.FC<IProps> = ({
  query,
  setQuery,
  refetch,
  selectedList,
  setSelectedList,
  onVisibleChange,
}) => {
  const intl = useIntl();
  const searchRef = useRef<HTMLDivElement>(null);

  const conditions = [
    {
      label: intl.formatMessage({
        id: "operation.name",
        defaultMessage: "Task Description",
      }),
      key: "name",
      type: "input" as const,
    },
  ];

  return (
    <div className={style.toolbar}>
      <div className="flex gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => refetch()}
              icon={<Icon type="refresh" />}
            />
            <Action
              onVisibleChange={onVisibleChange}
              view="main"
              position="toolbar"
              selectedList={selectedList}
              setSelectedList={setSelectedList}
            />
          </div>
        </div>
        <div>
          <Search
            conditions={conditions}
            container={searchRef}
            query={query}
            setQuery={setQuery}
          />
        </div>
      </div>
      <div ref={searchRef} className={style.searchBar} />
    </div>
  );
};

export default Toolbar;
