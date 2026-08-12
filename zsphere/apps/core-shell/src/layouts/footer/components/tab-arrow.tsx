import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useRegisterCommand } from "@zstack/zsphere-components";
import React, { useRef, useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

interface TabArrowProps {
  visible: boolean;
  onToggle: () => void;
}

const TabArrow: React.FC<TabArrowProps> = ({ visible, onToggle }) => {
  const intl = useIntl();
  const arrowBtnRef = useRef<HTMLDivElement>(null);

  const closeTooltip = () => {
    document.dispatchEvent(new PointerEvent("touchstart"));
    document.dispatchEvent(new PointerEvent("touchend"));
  };

  const [togglePanel, commandInfo] = useRegisterCommand({
    id: "expand.collapse.footer.panel",
    fn: () => {
      onToggle();
      closeTooltip();
    },
  });

  const tooltipTitle = useMemo(() => {
    if (!commandInfo) {
      return "";
    }

    const actionText = visible
      ? intl.formatMessage({
          id: "footer.panel.collapse.window",
          defaultMessage: "Collapse Window",
        })
      : intl.formatMessage({
          id: "footer.panel.expand.window",
          defaultMessage: "Expand Window",
        });

    return `${actionText} (${commandInfo.keyLabel})`;
  }, [commandInfo, intl, visible]);

  return (
    <Tooltip placement="top" title={tooltipTitle}>
      <div
        className={style["tab-arrow"]}
        onClick={togglePanel}
        ref={arrowBtnRef}
      >
        <span className={style.arrow}>
          {visible ? <Icon type="arrowhead-down" /> : <Icon type="arrowhead-up" />}
        </span>
        <span className={style.split} />
      </div>
    </Tooltip>
  );
};

export default TabArrow;
