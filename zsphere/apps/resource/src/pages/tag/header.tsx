import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const TagHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <Header.List
      title={intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
      className={style.header}
      description={intl.formatMessage({
        id: "tag.glossary",
        defaultMessage: "A tag is used to mark resources. You can use a tag to search for and aggregate resources.",
      })}
      docReaderPath="ZStack_User_Guide_0023_1.html"
    />
  );
};

export default TagHeader;
