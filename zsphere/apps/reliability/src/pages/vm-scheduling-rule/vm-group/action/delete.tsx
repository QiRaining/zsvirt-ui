import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { sumBy as _sumBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";

const Action: React.FC<IActionWrapperProps<VmGroup>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const deleteVmGroup = gql`
    mutation deleteVmGroup($input: DeleteVmGroupInput!) {
      deleteVmGroup(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteVmGroup,
      payload,
      name: intl.formatMessage({
        id: "delete.vmGroup",
        defaultMessage: "Delete VM Scheduling Group",
      }),
      total: selectedList.length,
      type: "VmGroup",
      onFinish: () => {
        if (window.location.pathname?.includes("/vm-group/detail")) {
          navigate(-1);
        }
        bus.emit("action:refetch:VmSchedulingRule");
      },
    });
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "vmGroup.modal.title.confirm.delete.vmGroup",
        defaultMessage: "Delete VM Scheduling Group?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vmGroup.modal.delete.alert.danger",
            defaultMessage: `If you delete the VM scheduling group, VM scheduling policies associated with the group will also be deleted. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "vmGroup",
        defaultMessage: "VM Scheduling Group",
      })}
      relatedResources={[
        {
          name: intl.formatMessage({
            id: "vmSchedulingRule",
            defaultMessage: "VM Scheduling Policy",
          }),
          count: _sumBy(selectedList, "vmSchedulingRuleCount"),
        },
      ]}
      resourceNames={selectedList.map((r) => r.name)}
      onConfirm={onOk}
    />
  );
};

export default Action;
