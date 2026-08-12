import { deleteGroup } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import type { VMGroupDirectoryTree } from "@zstack/virtualization-resource/src/pages/directory/utils";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IPorps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: VMGroupDirectoryTree[];
}

const DeleteGroup: React.FC<IPorps> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const doAction = useAction();

  const intl = useIntl();

  const onOk = async () => {
    const topNodes: VMGroupDirectoryTree[] = [];
    const nodesSet = new Set(selectedList);
    selectedList.forEach((node) => {
      let current = node.parent;
      while (current) {
        if (nodesSet.has(current)) {
          return;
        }
        current = current.parent;
      }
      topNodes.push(node);
    });

    const payload = topNodes.map((item) => {
      return {
        uuid: item.uuid,
        groupName: item.groupName,
      };
    });

    doAction({
      mutation: deleteGroup,
      payload,
      name: intl.formatMessage({
        id: "zsv.delete.group",
        defaultMessage: "Delete Folder",
      }),
      total: topNodes.length,
      type: "DirectoryGroup",
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "group.action.delete.alert.error",
            defaultMessage: `1. Deleting a group also deletes all its sub-groups.

2. After the group is deleted, virtual machines in this group and its sub-groups are moved to the default group.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "delete.vm.group.modal.tital.confirm",
        defaultMessage: "Delete Group?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DeleteGroup;
