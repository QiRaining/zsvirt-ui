import { Header } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import Detail from "./detail";
import Empty from "./detail/empty";

export default function HttpsCertificate() {
  const intl = useIntl();
  return (
    <div className="main-list-header-tabs-container">
      <Header.List
        className="main-list-header"
        title={intl.formatMessage({
          id: "cert.management",
          defaultMessage: "SSL Certificate",
        })}
      />
      {window.location.protocol === "https:" ? (
        <div className="zsv-list-padding">
          <Detail />
        </div>
      ) : (
        <div>
          <Empty />
        </div>
      )}
    </div>
  );
}
