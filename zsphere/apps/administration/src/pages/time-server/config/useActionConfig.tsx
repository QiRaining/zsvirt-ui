import { Button, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useActionConfig } from "@zstack/zsphere-engine/src/time-server";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useInternalTimeServerCandidates } from "../hooks";

const STYLE_BUTTON_ICON = { display: "flex", alignItems: "center" } as const;
const STYLE_BUTTON_TEXT_MARGIN_LEFT_4 = { marginLeft: 4 } as const;

export default () => {
  const intl = useIntl();
  const { managementNode } = usePlatformStore();
  const isDoubleManagementNode = managementNode?.isDoubleManagementNode;
  const { refetch: runTimeServerCandidates } =
    useInternalTimeServerCandidates();

  return useActionConfig<any>([
    {
      key: "edit.config",
      autoInjectPreValidator: false,
      extraRender: ({ onClick, source }) => {
        const { disabled, mnStatusloading, isNodeFailure } = source ?? {};

        const handleClick = () => {
          runTimeServerCandidates();
          onClick?.();
        };

        const btn = (
          <Button
            icon={<Icon type="edit" />}
            disabled={disabled}
            onClick={handleClick}
            loading={mnStatusloading}
            style={STYLE_BUTTON_ICON}
          >
            {
              <span style={STYLE_BUTTON_TEXT_MARGIN_LEFT_4}>
                {intl.formatMessage({
                  id: "modifyConfig",
                  defaultMessage: "Modify Configuration",
                })}
              </span>
            }
          </Button>
        );

        if (isDoubleManagementNode && isNodeFailure) {
          return (
            <Tooltip
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "modify.ntp.node.failure.tooltip",
                    defaultMessage: "You cannot modify the configuration, because there is a disconnected management node.",
                  })}
                </ReactMarkdown>
              }
            >
              {btn}
            </Tooltip>
          );
        }

        return btn;
      },
      ActionWrapper: require("../action/update").default,
    },
    {
      key: "ntp.sync.time",
      autoInjectPreValidator: false,
      extraRender: ({ onClick, source }) => {
        const { disabled, mnStatusloading, isNodeFailure } = source ?? {};

        const btn = (
          <Button
            icon={<Icon type="sync" />}
            disabled={disabled}
            onClick={() => onClick?.()}
            loading={mnStatusloading}
            style={STYLE_BUTTON_ICON}
          >
            {
              <span style={STYLE_BUTTON_TEXT_MARGIN_LEFT_4}>
                {intl.formatMessage({
                  id: "ntp.sync.time",
                  defaultMessage: "Sync Time",
                })}
              </span>
            }
          </Button>
        );
        if (isDoubleManagementNode && isNodeFailure) {
          return (
            <Tooltip
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "sync.ntp.node.failure.tooltip",
                    defaultMessage: "You cannot synchronize time, because there is a disconnected management node.",
                  })}
                </ReactMarkdown>
              }
            >
              {btn}
            </Tooltip>
          );
        }
        return btn;
      },
      ActionWrapper: require("../action/sync").default,
    },
  ]);
};
