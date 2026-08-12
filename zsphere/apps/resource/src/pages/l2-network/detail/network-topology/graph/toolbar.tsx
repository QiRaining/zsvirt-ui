import { Icon } from "@zstack/icon";
import { Space } from "antd";
import { useIntl } from "react-intl";

import type { IToolbar } from "./type";

import style from "./style.module.less";

const Toolbar = ({
  onRefresh,
  onZoomIn,
  onZoomOut,
  onReset,
  onDownload,
  onToggleVmVisible,
  vmVisible,
  onToggleFullscreen,
  fullscreen,
}: IToolbar) => {
  const intl = useIntl();

  return (
    <div className={style["network-topo-toolbar"]}>
      <div className="flex items-center justify-between">
        <div>
          <Space
            size={24}
            split={<div className={style["network-topo-toolbar-divider"]} />}
            align="center"
          >
            <div
              className={style["network-topo-toolbar-btn"]}
              onClick={onRefresh}
            >
              <Icon type="refresh" />
              <div className={style["network-topo-toolbar-btn-text"]}>
                {intl.formatMessage({
                  id: "refresh",
                  defaultMessage: "Refresh",
                })}
              </div>
            </div>
            <div className="flex gap-1">
              <div>
                <div
                  onClick={() => onZoomIn?.()}
                  className={style["network-topo-toolbar-btn"]}
                >
                  <Icon type="plus" />
                  <div className={style["network-topo-toolbar-btn-text"]}>
                    {intl.formatMessage({
                      id: "zoomIn",
                      defaultMessage: "Zoom in",
                    })}
                  </div>
                </div>
              </div>
              <div>
                <div
                  onClick={() => onZoomOut?.()}
                  className={style["network-topo-toolbar-btn"]}
                >
                  <Icon type="minus" />
                  <div className={style["network-topo-toolbar-btn-text"]}>
                    {intl.formatMessage({
                      id: "zoomOut",
                      defaultMessage: "Zoom out",
                    })}
                  </div>
                </div>
              </div>
              <div>
                <div
                  onClick={() => onReset?.()}
                  className={style["network-topo-toolbar-btn"]}
                >
                  <Icon type="pin" />
                  <div className={style["network-topo-toolbar-btn-text"]}>
                    {intl.formatMessage({
                      id: "default.position",
                      defaultMessage: "Default Location",
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={style["network-topo-toolbar-btn"]}
              onClick={() => onDownload?.()}
            >
              <Icon type="download" />
              <div className={style["network-topo-toolbar-btn-text"]}>
                {intl.formatMessage({
                  id: "export",
                  defaultMessage: "Export ",
                })}
              </div>
            </div>
            <div
              onClick={() => {
                onToggleVmVisible?.();
              }}
              className={style["network-topo-toolbar-btn"]}
            >
              <Icon type={vmVisible ? "eye-off" : "eye"} />
              <div className={style["network-topo-toolbar-btn-text"]}>
                {vmVisible
                  ? intl.formatMessage({
                      id: "hide.vm",
                      defaultMessage: "Hide Virtual Machine",
                    })
                  : intl.formatMessage({
                      id: "show.vm",
                      defaultMessage: "Show Virtual Machine",
                    })}
              </div>
            </div>
            {!fullscreen && (
              <div
                onClick={() => {
                  onToggleFullscreen?.();
                }}
                className={style["network-topo-toolbar-btn"]}
              >
                <Icon type="expand" />
                <div className={style["network-topo-toolbar-btn-text"]}>
                  {intl.formatMessage({
                    id: "fullscrean",
                    defaultMessage: "Full",
                  })}
                </div>
              </div>
            )}
          </Space>
        </div>
        <div>
          {fullscreen && (
            <div
              onClick={() => {
                onToggleFullscreen?.();
              }}
              className={style["network-topo-toolbar-exit-btn"]}
            >
              <Space>
                <Icon type="collapse" />
                <span>
                  {intl.formatMessage({
                    id: "exit.fullscreen",
                    defaultMessage: "Exit Full Screen",
                  })}
                </span>
              </Space>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
