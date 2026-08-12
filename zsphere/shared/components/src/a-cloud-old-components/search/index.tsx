import { Icon } from "@zstack/icon";
import { useToggle } from "ahooks";
import { Button } from "antd";
import React, { FC } from "react";
import { createPortal } from "react-dom";
import { useIntl } from "react-intl";

import Box from "./box";
import type { ISearchProps, Condition } from "./type";

const Search: FC<ISearchProps> = ({ container, btnText, ...otherProps }) => {
  const intl = useIntl() as any;
  const { hiddenSearchButton = false } = otherProps;
  const [visible, { toggle: toggleVisible }] = useToggle(hiddenSearchButton);

  const SearchBox = (
    <div style={{ display: visible ? "block" : "none" }}>
      <Box {...otherProps} toggleVisible={toggleVisible} />
    </div>
  );

  return (
    <>
      {!hiddenSearchButton && (
        <Button onClick={() => toggleVisible()}>
          <Icon type="search" />
          {btnText ||
            intl.formatMessage({ id: "search", defaultMessage: "Search" })}
        </Button>
      )}
      {container.current && createPortal(SearchBox, container.current)}
    </>
  );
};

export default Search;
export type { ISearchProps, Condition as ISearchCondition };
