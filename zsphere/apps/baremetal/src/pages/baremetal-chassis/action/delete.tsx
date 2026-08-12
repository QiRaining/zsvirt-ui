import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { deleteBaremetalChassis } from "../../../gql/baremetal-chassis.gql";
import useModalOpenState from "../../../utils/use-modal-show-state";

const Action: React.FC<IActionWrapperProps<IBaremetalChassis>> = ({
  view,
  visible,
  setVisible,
  setSelectedList,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const { open, afterClose } = useModalOpenState({ visible });
  const navigate = useNavigate();
  const onOk = async () => {
    doAction({
      mutation: deleteBaremetalChassis,
      payload: selectedList.map(({ uuid }) => ({ uuid })),
      name: intl.formatMessage({
        id: "delete.baremetalChassis",
        defaultMessage: "Delete Bare Metal Chassis",
      }),
      total: selectedList.length,
      type: "BaremetalChassis",
    });

    if (view === "sub") {
      navigate("/baremetal-chassis");

      return;
    }

    setVisible(false);
    setSelectedList?.([]);
  };

  if (!open) {
    return null;
  }

  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      title={intl.formatMessage({
        id: "baremetalChassis.modal.title.confirm.delete.baremetalChassis",
        defaultMessage: "Delete Bare Metal Chassis?",
      })}
      resourceType={intl.formatMessage({
        id: "baremetalChassis",
        defaultMessage: "Bare Metal Chassis",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "baremetalChassis.modal.detach.delete.alert.danger",
        defaultMessage:
          "Deleting bare metal chassis will also delete bare metal instances created from these bare metal chassis. Proceed with caution.",
      })}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      needValidate={needValidate}
      afterClose={afterClose}
    />
  );
};

export default Action;
