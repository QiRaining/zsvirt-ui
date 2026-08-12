import HotAddList from "@zstack/virtualization-resource/src/pages/vm/components/hot-add";
import { ModalSelect } from "@zstack/zsphere-components";
import React, { useState } from "react";
import { useIntl } from "react-intl";

export default function HotAddDescription() {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <span>
        {intl.formatMessage({
          id: "hot.add.os.preview.description",
          defaultMessage: "To learn more about supported OSes. ",
        })}
      </span>
      <a onClick={() => setVisible(true)}>
        {intl.formatMessage({ id: "view", defaultMessage: "View" })}
      </a>
      <ModalSelect
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "hot.add.os.preview.title",
          defaultMessage: "Hot Plug Supported OSes",
        })}
        alertType="info"
        alertMessage={intl.formatMessage({
          id: "hot.add.os.preview.alert",
          defaultMessage:
            "If the OS does not support either CPU hot plug or memory hot plug, both features are unavailable.",
        })}
        showSelect={false}
        renderFooter={({ node }) => {
          const [cancel, ok] = (node as React.ReactElement).props.children;
          return (
            <>
              {cancel}
              {React.cloneElement(ok, { disabled: false })}
            </>
          );
        }}
        destroyOnClose
      >
        <HotAddList />
      </ModalSelect>
    </div>
  );
}
