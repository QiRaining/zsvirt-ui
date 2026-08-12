import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  isValid: boolean;
  tooltipMessage?: string;
}

const ListIcon: React.FC<IProps> = ({ isValid, tooltipMessage }) => {
  const intl = useIntl();
  return !isValid ? (
    <Tooltip
      title={
        tooltipMessage ??
        intl.formatMessage({
          id: "data.protect.warning.title",
          defaultMessage: "Integrity validation failed",
        })
      }
    >
      <Icon
        type="alert-triangle-fill"
        color="alert"
        style={{ marginLeft: 4 }}
      />
    </Tooltip>
  ) : null;
};

export default ListIcon;
