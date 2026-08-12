import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const deleteTag = gql`
  mutation ($input: DeleteTagInput!) {
    deleteTag(input: $input) {
      actionId
    }
  }
`;
const TagAction: React.FC<IActionWrapperProps<ITag>> = ({
  visible,
  position,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const handleDelete = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteTag,
      payload,
      name: intl.formatMessage({
        id: "tag.action.delete",
        defaultMessage: "Delete Tag",
      }),
      total: selectedList.length,
      onFinish: (result: IActionResult) => {
        console.log(result);
        if (
          position === "header" &&
          localStorage.getItem("currentEnv") !== `"virtualization"`
        ) {
          navigate("/tag");
          return;
        }
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      onConfirm={handleDelete}
      visible={visible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "tag.modal.title.confirm.delete.tag",
        defaultMessage: "Delete Tag?",
      })}
    />
  );
};

export default TagAction;
