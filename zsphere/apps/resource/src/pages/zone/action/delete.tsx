import { useApolloClient } from "@apollo/client";
import { DialogP0, DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { deleteZone, zoneList } from "../../../gql/zone.gql";

const Action: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const apolloClient = useApolloClient();
  const needValidate = useSensitiveJudge();
  const navigate = useNavigate();
  const onOk = async () => {
    doAction({
      mutation: deleteZone,
      payload: selectedList.map((cv) => ({
        uuid: cv.uuid,
      })),
      name: intl.formatMessage({
        id: "delete.zone",
        defaultMessage: "Delete  Data Center",
      }),
      total: selectedList.length,
      type: "Zone",
      onFinish: async () => {
        setSelectedList?.([]);
        const { data } = await apolloClient.query({
          query: zoneList,
          variables: { start: 0, limit: 1 },
          fetchPolicy: "network-only",
          errorPolicy: "ignore",
        });
        const total = data?.zoneList?.total ?? 0;
        if (total === 0) {
          setTimeout(() => {
            navigate("/virtualization-dashboard");
          }, 0);
        }
      },
    });
  };

  const alertMessage = useMemo(() => {
    return intl.formatMessage({
      id: "dataCenter.modal.delete.alert.danger",
      defaultMessage:
        "Deleting a data center will delete clusters, hosts, networks, and data storage resources, along with all subordinate resources (such as virtual machines) of each resource. Proceed with caution.",
    });
  }, [intl]);

  const commonProps = {
    visible,
    setVisible,
    title: intl.formatMessage({
      id: "zone.modal.title.confirm.delete.zone",
      defaultMessage: "Delete Data Center?",
    }),
    bannerMessage: alertMessage,
    resourceNames: selectedList.map((r) => r.name),
  };

  if (needValidate) {
    return (
      <DialogP0Smart
        {...commonProps}
        onConfirm={() => {
          onOk();
        }}
        needValidate={needValidate}
      />
    );
  }

  return (
    <DialogP0
      {...commonProps}
      onConfirm={() => {
        onOk();
      }}
      confirmText={intl.formatMessage({ id: "delete", defaultMessage: "Delete" })}
      guide={{
        confirmWord: "Delete",
      }}
    />
  );
};

export default Action;
