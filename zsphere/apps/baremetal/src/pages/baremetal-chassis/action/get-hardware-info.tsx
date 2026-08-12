import { gql, useLazyQuery } from "@apollo/client";
import { DialogBase, DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BaremetalChassisPowerStatusType, Op } from "@zstack/zsphere-types";
import type {
  BaremetalChassis,
  BaremetalPxeServerQueryResp,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { inspectBaremetalChassis } from "../../../gql/baremetal-chassis.gql";

const QUERY_BAREMETAL_PXE_SERVER_LIST = gql`
  query baremetalPxeServerList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: BaremetalPxeServerQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    baremetalPxeServerList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
    }
  }
`;

const Action: React.FC<IActionWrapperProps<BaremetalChassis>> = ({
  visible,
  setVisible,
  setSelectedList,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [innerVisible, setInnerVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const [query, { data }] = useLazyQuery<{
    baremetalPxeServerList: BaremetalPxeServerQueryResp;
  }>(QUERY_BAREMETAL_PXE_SERVER_LIST, {
    onCompleted(d) {
      if (!d?.baremetalPxeServerList?.total) {
        setErrorVisible(true);
        return;
      }

      if (visible) {
        setInnerVisible(true);
      }
    },
    fetchPolicy: "network-only",
  });

  const sendQuery = usePersistFn(() => {
    const clusterUuid = selectedList?.[0]?.clusterUuid;

    if (!clusterUuid) {
      return;
    }

    query({
      variables: {
        conditions: [
          {
            key: "cluster.uuid",
            op: Op.eq,
            value: clusterUuid,
          },
        ],
      },
    });
  });

  const onOk = () => {
    doAction({
      mutation: inspectBaremetalChassis,
      payload: selectedList.map(({ uuid }) => ({
        uuid,
      })),
      name: intl.formatMessage({
        id: "send.restartIpmiCmd",
        defaultMessage: 'Send a command to reboot "ipmi".',
      }),
      middleState: {
        type: "BaremetalChassis",
        field: "status powerStatus",
        data: {
          status: "PxeBooting",
          powerStatus: BaremetalChassisPowerStatusType.Rebooting,
        },
        uuids: selectedList.map((item) => item.uuid),
      },
      total: selectedList.length,
    });

    setVisible(false);

    setInnerVisible(false);

    setSelectedList?.([]);
  };

  useEffect(() => {
    if (visible) {
      sendQuery();
    }
  }, [visible]);

  if (!visible || !innerVisible || !data?.baremetalPxeServerList?.total) {
    return (
      <DialogBase
        visible={errorVisible}
        setVisible={(v) => {
          setErrorVisible(v);
          if (!v) {
            setVisible(false);
            setSelectedList?.([]);
          }
        }}
        title={intl.formatMessage({
          id: "baremetalChassis.modal.title.cannot.getHardwareInfo",
          defaultMessage:
            "The baremetal cluster where the baremetal chassis reside does not attach any deployment server. To obtain the hardware information, attach deployment servers to the baremetal cluster.",
        })}
        hideCancelButton
        onOk={() => {
          setErrorVisible(false);
          setVisible(false);
          setSelectedList?.([]);
        }}
      >
        {null}
      </DialogBase>
    );
  }

  return (
    <DialogP1
      visible={visible && innerVisible}
      setVisible={(nextVisible) => {
        setVisible(nextVisible);
        setInnerVisible(nextVisible);
      }}
      title={intl.formatMessage({
        id: "baremetalChassis.modal.title.confirm.get.hardwareInfo",
        defaultMessage: "Obtain Hardware Information?",
      })}
      bannerMessage={intl.formatMessage({
        id: "baremetalChassis.modal.get.hardwareInfo.alert.warn",
        defaultMessage:
          "To obtain the hardware information of baremetal chassis, note the following:\n\n1. Baremetal chassis will be rebooted for a period of time.\n\n2. Adjust your businesses that run on the baremetal chassis.",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "baremetalChassis",
        defaultMessage: "Bare Metal Chassis",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
