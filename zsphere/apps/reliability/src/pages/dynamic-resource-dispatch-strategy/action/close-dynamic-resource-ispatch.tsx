import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { DRS as IDRS } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refetch?: any;
  selectedList?: IDRS[];
}

const updateClusterDRSState = gql`
  mutation updateClusterDRSState($input: UpdateClusterDRSStateInput!) {
    updateClusterDRSState(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    // const uuids = selectedList.map(item => {
    //   return { uuid: item.uuid }
    // })

    doAction({
      mutation: updateClusterDRSState,
      payload: {
        uuid: selectedList[0]?.uuid,
        state: "Disabled",
      },
      name: intl.formatMessage({
        id: "disable.drs",
        defaultMessage: "Disable DRS",
      }),
      total: 1,
      type: "ClusterDRS",
      onProgress: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={intl.formatMessage({
        id: "virtualization.cluster.detail.drs.disable.confirm.alertMessage",
        defaultMessage: "Disable DRS?",
      })}
      onConfirm={onOk}
      description={
        <div>
          {intl.formatMessage({
            id: "virtualization.cluster.detail.drs.disable.confirm.text",
            defaultMessage:
              "Disabling DRS may lead to an inability to balance host loads under high-load scenarios, potentially impacting business performance.",
          })}
        </div>
      }
    />
  );
};

export default Action;
