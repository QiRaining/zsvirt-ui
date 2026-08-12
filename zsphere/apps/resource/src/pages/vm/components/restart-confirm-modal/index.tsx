import { Alert, Button } from "@zstack/design";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

// Style constants
const CONTENT_MARGIN_BOTTOM_STYLE = { marginBottom: "20px" } as const;

interface IProps {
  list: ListItem[];
  visible: boolean;
  setVisible: (val: boolean) => void;
  alertMessage?: string;
  title?: string;
  configNumber?: number;
  onOk: (val?: boolean) => void;
  type?: "table" | "lsit";
  resetConfig?: () => void;
}

const RestartConfirmModal: React.FC<IProps> = ({
  list,
  visible,
  setVisible,
  resetConfig,
  title,
  configNumber,
  alertMessage,
  onOk,
  type,
}) => {
  const intl = useIntl();
  const transformList = (_list: ListItem[]) => {
    return _list.map((item) => ({
      ...item,
      value: _.isArray(item.value)
        ? item.value.map((val, index) => (
            <p className={style.value} key={`${item.label}-${index}`}>
              {val}
            </p>
          ))
        : item.value,
    }));
  };
  const footer = (
    <div className="flex items-center gap-2">
      <Button
        variant="link"
        onClick={() => {
          setVisible(false);
          resetConfig?.();
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      <Button
        className={style.actionBtn}
        variant="secondary"
        onClick={() => {
          onOk();
        }}
      >
        {intl.formatMessage({ id: "rebot.later", defaultMessage: "Reboot later." })}
      </Button>
      <Button
        variant="primary"
        onClick={async () => {
          onOk(true);
        }}
      >
        {intl.formatMessage({ id: "rebot.now", defaultMessage: "Restart immediately." })}
      </Button>
    </div>
  );

  return (
    <DialogBase
      title={
        title ?? intl.formatMessage({ id: "hint", defaultMessage: "Notice" })
      }
      visible={visible}
      setVisible={setVisible}
      onCancel={() => setVisible(false)}
      footer={footer}
      widthClassName="w-[600px]"
    >
      <div className="padding24">
        <Alert variant="warning" style={CONTENT_MARGIN_BOTTOM_STYLE}>
          {alertMessage ??
            intl.formatMessage(
              {
                id: "virtualization.edit.vm.config.alert.need.restart",
                defaultMessage: "The following {num} settings need to be reapplied after restarting the virtual machine...",
              },
              { num: configNumber },
            )}
        </Alert>
        {type === "table" ? (
          <List list={transformList(list)} />
        ) : (
          <div className={style.list}>
            {list.map((item) => (
              <p key={item.label}>{item.label}</p>
            ))}
          </div>
        )}
      </div>
    </DialogBase>
  );
};

export default RestartConfirmModal;
