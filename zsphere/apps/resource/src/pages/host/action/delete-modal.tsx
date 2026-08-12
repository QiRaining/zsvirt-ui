import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { sum as _sum } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";

import { deleteHosts } from "../../../gql/host.gql";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  position,
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  //***处理敏感操作***
  const needValidate = useSensitiveJudge();

  const allVmCount = (_sum(selectedList.map((it) => it?.relatedVmCount)) ??
    0) as number;
  const allVolumeCount = (_sum(
    selectedList.map((it) => it?.relatedVolumeCount),
  ) ?? 0) as number;

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteHosts,
      payload,
      name: intl.formatMessage({
        id: "delete.host",
        defaultMessage: "Delete Host",
      }),
      total: selectedList.length,
      onFinish: () => {
        if (
          position === "header" &&
          localStorage.getItem("currentEnv") !== `"virtualization"`
        ) {
          navigate("/host");
          return;
        }

        refetch?.();
        setSelectedList?.([]);
      },
      type: "HostVO",
    });
  };

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "host.modal.title.confirm.delete.host",
        defaultMessage: "Delete Host?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "host.modal.delete.alert.danger",
            defaultMessage: `1. If the host's cluster has shared storage attached, this operation will stop all virtual machines on the host. Virtual machines with HA enabled will automatically migrate to and reboot on other hosts with sufficient resources in the cluster.
2. If the host's cluster has local storage attached, this operation will delete all virtual machines and disks on the host. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "host",
        defaultMessage: "Host",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
      needValidate={needValidate}
    />
  );
};

export default Action;
