import { deleteVmTemplate } from "@zstack/virtualization-resource/src/gql/vm-template.gql";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmTemplate as IVmTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const Action: React.FC<IActionWrapperProps<IVmTemplate>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  //***处理敏感操作***
  const needValidate = useSensitiveJudge();
  const onOk = async () => {
    doAction({
      mutation: deleteVmTemplate,
      payload: selectedList.map((cv) => ({
        uuid: cv.uuid,
      })),
      name: intl.formatMessage({
        id: "delete.vm.template",
        defaultMessage: "Delete Template",
      }),
      total: selectedList.length,
      type: "VmTemplate",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "vm.template.modal.title.confirm.delete.vm.template",
        defaultMessage: "Delete Virtual Machine Template?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "templated.vm.action.direct.delete.alert.error",
            defaultMessage: `The template (including NICs, disks, and database records) cannot be recovered after being deleted. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "vm.template",
        defaultMessage: "Virtual Machine Template",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      needValidate={needValidate}
    />
  );
};

export default Action;
