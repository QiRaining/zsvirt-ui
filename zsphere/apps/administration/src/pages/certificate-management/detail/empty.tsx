import { Empty as ZstackEmpty } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import Toolbar from "./toolbar";

import style from "./style.module.less";

export default function Empty() {
  const intl = useIntl();
  return (
    <ZstackEmpty
      className={style.empty}
      description={
        <>
          <span>
            {intl.formatMessage({
              id: "cert.management.empty.description",
              defaultMessage: "This is an HTTP access and has data security vulnerabilities...",
            })}
          </span>
          <br />
          <span>
            {intl.formatMessage({
              id: "cert.management.empty.description.suggestion",
              defaultMessage:
                "You can seamlessly switch to HTTPS access, and the switching process will not affect business operations. After the switch, you need to relogin to ensure data security.",
            })}
          </span>
        </>
      }
    >
      <Toolbar view="virtualization.main.http" />
    </ZstackEmpty>
  );
}
