import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { L3NetworkQueryType, Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation, useSearchParams } from "react-router";

import L3NetworkList from "../list";

const zsvShareResource = gql`
  mutation zsvShareResource($input: ZsvShareResourceToGroupInput!) {
    zsvShareResource(input: $input) {
      actionId
    }
  }
`;

const ShareResourceAction: React.FC<IActionWrapperProps<any>> = ({
  refetch,
  visible,
  setVisible,
  source,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const pathname = useLocation().pathname;
  const uuid = useSearchParams()[0].get("uuid") ?? "";
  const isUserGroup = pathname.includes("/user-group/detail");

  const onOk = async (values: Array<{ uuid: string }>) => {
    setVisible(false);

    const payload = isUserGroup
      ? {
          resourceUuids: values.map((v) => v.uuid),
          userGroupUuids: [uuid],
        }
      : {
          resourceUuids: values.map((v) => v.uuid),
          accountUuids: [uuid],
        };

    doAction({
      mutation: zsvShareResource,
      payload,
      name: intl.formatMessage({
        id: "virtualization.share.resource",
        defaultMessage: "Share Resource",
      }),
      total: 1,
      type: "Owner",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const defaultQuery = useMemo(
    () => ({
      type: L3NetworkQueryType.ZSV_NOT_Shared_Resource_Flat_Network,
      conditions: [{ key: "system", op: Op.eq, value: "false" }],
      extraConditions: [
        {
          key: isUserGroup ? "groupUuid" : "accountUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid, isUserGroup],
  );

  const modalProps = useMemo(
    () => ({
      visible,
      setVisible,
      showSelect: false,
      selectType: "checkbox" as const,
      resourceName: source?.name,
      title: intl.formatMessage({
        id: "share.resource.title",
        defaultMessage: "Share Resource",
      }),
      onOk,
    }),
    [intl, source?.name, visible],
  );

  return (
    <ModalSelect {...modalProps}>
      <L3NetworkList view="select" defaultQuery={defaultQuery} />
    </ModalSelect>
  );
};

export default ShareResourceAction;
