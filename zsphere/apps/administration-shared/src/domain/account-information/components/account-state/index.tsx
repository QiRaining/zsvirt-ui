import { State } from "@zstack/zsphere-components";
import { State as StateEnum } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";

const AccountState: React.FC<{ state: StateEnum }> = ({ state }) => {
  const intl = useIntl();

  const accountStateMap = new Map<StateEnum, React.ReactElement>([
    [
      StateEnum.Enabled,
      <State
        type="success"
        icon="play-circle-fill"
        name={intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" })}
      />,
    ],
    [
      StateEnum.Disabled,
      <State
        type="error"
        icon="stop-circle-fill"
        name={intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" })}
      />,
    ],
    [
      StateEnum.Staled,
      <State
        type="disabled"
        icon="close-circle-fill"
        name={intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" })}
      />,
    ],
  ]);

  return accountStateMap.get(state) || null;
};

export default AccountState;
