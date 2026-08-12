import { gql, useLazyQuery } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  BasicEndPoint as IBasicEndPoint,
  GroupAction as IGroupAction,
  UpdateMonitorGroupPayload as IUpdateMonitorGroupPayload,
} from "@zstack/zsphere-types/graphql";
import { filter as _filter } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { monitorGroupList } from "../../../gql/zwatch-endpoint.gql";

const updateMonitorGroup = gql`
  mutation updateMonitorGroup($input: UpdateMonitorGroupInput!) {
    updateMonitorGroup(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IBasicEndPoint>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();

  const [currentActions, setCurrentActions] = useState<IGroupAction[]>([]);
  const [queryMonitorGroupList, { data: _monitorGroupData }] = useLazyQuery(
    monitorGroupList,
    {
      fetchPolicy: "network-only",
      onCompleted(data) {
        if (data?.monitorGroupList?.list) {
          const currentMonitorGroup = data?.monitorGroupList?.list?.[0];
          const currentMonitorGroupActions: IGroupAction[] = [];
          currentMonitorGroup?.actions?.forEach((it: IGroupAction) => {
            currentMonitorGroupActions.push({
              actionUuid: it.actionUuid,
              actionType: "sns",
            });
          });
          setCurrentActions(currentMonitorGroupActions);
        }
      },
    },
  );

  useEffect(() => {
    queryMonitorGroupList({
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.eq,
            value: searchParams.get("uuid"),
          },
        ],
      },
    });
  }, [selectedList]);

  const onOk = async () => {
    const removeActionsUuids = selectedList?.map((it) => it?.topic?.uuid);
    const payload: IUpdateMonitorGroupPayload = {
      actions: _filter(currentActions, (it: IGroupAction) => {
        return !removeActionsUuids.includes(it.actionUuid);
      }),
      uuid: searchParams.get("uuid") as string,
    };
    doAction({
      mutation: updateMonitorGroup,
      payload,
      name: intl.formatMessage({
        id: "remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint",
      }),
      total: selectedList.length,
      type: "MonitorGroup",
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.confirm.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint?",
      })}
      resourceNames={selectedList.map((item) => {
        return item.type === "SYSTEM_HTTP"
          ? intl.formatMessage({
              id: "systemAlarmNoticeObject",
              defaultMessage: "System Endpoint",
            })
          : (item.name ?? item.uuid);
      })}
    />
  );
};

export default Action;
