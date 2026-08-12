import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ModalSelect } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import StorageUsedList from "./list";

import styles from "./style.module.less";

export default ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Tooltip
        title={intl.formatMessage({
          id: "look.for.detail",
          defaultMessage: "View Details",
        })}
      >
        <Icon className={styles.audit} onClick={() => setVisible(true)} type="audit" />
      </Tooltip>

      <ModalSelect
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "storage.usrd.detail.title",
          defaultMessage: "Storage Usage Details",
        })}
        alertType="info"
        alertMessage={intl.formatMessage({
          id: "storage.usrd.detail.alert",
          defaultMessage: "Displays only mounted disk partition utilization.",
        })}
        showSelect={false}
        renderFooter={({ node }) => {
          const [_cancel, ok] = (node as React.ReactElement).props.children;
          return <>{React.cloneElement(ok, { disabled: false })}</>;
        }}
        destroyOnClose
      >
        <StorageUsedList
          defaultQuery={{
            conditions: [
              {
                key: "uuid",
                op: Op.eq,
                value: uuid || "",
              },
            ],
          }}
        />
      </ModalSelect>
    </div>
  );
};
