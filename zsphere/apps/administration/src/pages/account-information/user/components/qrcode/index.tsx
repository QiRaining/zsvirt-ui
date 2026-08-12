import { Tooltip } from "@zstack/design";
import { Popover } from "antd";
import QRCode from "qrcode.react";
import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import styles from "./index.module.less";

interface IProps {
  value: string;
  title?: string;
  toolTipTitle?: string;
  placement?:
    | "topLeft"
    | "top"
    | "topRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "right"
    | "rightBottom"
    | "bottomLeft"
    | "bottom"
    | "bottomRight";
}

const QRC: React.FC<IProps> = ({ value, title, toolTipTitle, placement }) => {
  const intl = useIntl();

  const download = useCallback(() => {
    const canvas = document.getElementById("qrcode_canvas") as any;
    const saveUrl = canvas.toDataURL("image/png") as any;
    const dlink = document.createElement("a");
    dlink.setAttribute("type", "hidden");
    document.body.appendChild(dlink);
    dlink.href = saveUrl;
    dlink.download = "QRCode";
    dlink.click();
  }, []);

  const content = useMemo(() => {
    return (
      <div className={styles.zsvcontent}>
        <QRCode id="qrcode_canvas" value={value} size={100} />
      </div>
    );
  }, [intl, value]);

  const handleDownloadClick = useCallback(() => {
    download();
  }, [download]);

  return (
    <span className={styles.zsvContainer}>
      {toolTipTitle ? (
        <Tooltip title={toolTipTitle}>
          <Popover
            overlayClassName={styles.overlayClassName}
            placement={placement ?? "bottom"}
            content={content}
            trigger="click"
          >
            <span>
              {title ? <span className={styles.title}>{title}</span> : ""}
            </span>
          </Popover>
        </Tooltip>
      ) : (
        <Popover
          overlayClassName={styles.overlayClassName}
          placement={placement ?? "bottom"}
          content={content}
          trigger="click"
        >
          <span>
            {title ? <span className={styles.title}>{title}</span> : ""}
          </span>
        </Popover>
      )}
      <div className={styles.download}>
        <span onClick={handleDownloadClick}>
          {intl.formatMessage({ id: "download", defaultMessage: "Download" })}
        </span>
      </div>
    </span>
  );
};

export default QRC;
