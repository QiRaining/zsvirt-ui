import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAuth, Empty as ZsEmpty } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import { isEmpty as _isEmpty } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import Create from "./create";

import style from "./style.module.less";

const EMPTY_LIST: never[] = [];

interface IProps {
  current?: SnmpAgent;
  refetch: Function;
}

const startSnmpAgent = gql`
  mutation startSnmpAgent($input: StartSnmpAgentInput!) {
    startSnmpAgent(input: $input) {
      actionId
    }
  }
`;

const Empty: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const canEdit = hasAuth({
    type: "action",
    authKey: "edit",
    resource: "snmp.agent",
  });
  const [visible, setVisible] = React.useState(false);

  const { isEmpty, isDisabled } = React.useMemo(
    () => ({
      isEmpty: _isEmpty(current),
      isDisabled: current?.status === "Disable",
    }),
    [current],
  );

  const enableSnmp = React.useCallback(() => {
    doAction({
      mutation: startSnmpAgent,
      payload: { uuid: current?.uuid },
      name: intl.formatMessage({
        id: "start.snmp.management",
        defaultMessage: "Enable SNMP Management",
      }),
      total: 1,
      type: "SnmpAgent",
    });
  }, [current, doAction, intl]);

  const handleActionClick = React.useCallback(() => {
    if (isEmpty) {
      setVisible(true);
    }

    if (isDisabled) {
      enableSnmp();
    }
  }, [enableSnmp, isDisabled, isEmpty]);

  return (
    <div>
      <div className={style["empty-card"]}>
        <ZsEmpty type="Table" />
        <div>
          {canEdit && (
            <Button
              variant="primary"
              className={style.btn}
              icon={<Icon type="arrow-right" />}
              onClick={handleActionClick}
            >
              {intl.formatMessage({
                id: "enable.snmp.management",
                defaultMessage: "Enable SNMP Management",
              })}
            </Button>
          )}
        </div>
      </div>

      <Create
        visible={visible}
        setVisible={setVisible}
        selectedList={EMPTY_LIST}
        position="header"
        view="virtualization.main"
      />
    </div>
  );
};

export default Empty;
