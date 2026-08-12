import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UserGroup as IUserGroup,
  AccountVO as IAccount,
  VmInstance as IVmInstance,
  Image as IImage,
  VmTemplate as IVmTemplate,
  L2Network as IL2Network,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import BindRoleConfirmModal from "../components/bind-role-confirm-modal";
import ShareResourceConfig from "../components/share-resource";
import { analyzeAccountTypes } from "../utils";

const zsvShareResource = gql`
  mutation zsvShareResource($input: ZsvShareResourceToGroupInput!) {
    zsvShareResource(input: $input) {
      actionId
    }
  }
`;

const CHUNKSIZE = 50;

const Action: React.FC<IActionWrapperProps<IUserGroup | IAccount>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const isGroup = (selectedList?.[0] as any)?.__typename === "UserGroup";
  const { onlyNormalAndThirdParty, isUserGroup } = analyzeAccountTypes(
    selectedList || [],
  );

  const onOk = async (values: any) => {
    setVisible(false);

    const {
      vmList = [],
      vmTemplateList = [],
      l2NetworkList = [],
      l3NetworkList = [],
      imageList = [],
    } = values;

    const resourceUuids = _.chunk(
      [
        ...vmList.map((vm: IVmInstance) => vm.uuid),
        ...vmTemplateList.map((vmTemplate: IVmTemplate) => vmTemplate.uuid),
        ...l2NetworkList.map((l2Network: IL2Network) => l2Network.uuid),
        ...l3NetworkList.map((l3Network: IL3Network) => l3Network.uuid),
        ...imageList.map((image: IImage) => image.uuid),
      ],
      CHUNKSIZE,
    );

    const payload = isGroup
      ? {
          userGroupUuids: (selectedList as IUserGroup[]).map(
            (group: IUserGroup) => group.uuid,
          ),
          resourceUuids,
        }
      : {
          accountUuids: selectedList.map((account: IAccount) => account.uuid),
          resourceUuids,
        };

    doAction({
      mutation: zsvShareResource,
      payload,
      name: intl.formatMessage({
        id: "virtualization.share.resource",
        defaultMessage: "Share Resource",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  if (!onlyNormalAndThirdParty && !isUserGroup) {
    return (
      <BindRoleConfirmModal
        visible={visible}
        setVisible={setVisible}
        onOk={() => {
          setVisible(false);
          setSelectedList?.([]);
        }}
        modalConfirmContent={intl.formatMessage({
          id: "share.resource.mixed.content",
          defaultMessage: "To share resources with multiple users, all selected users must be of the same type.",
        })}
        alertMessage={intl.formatMessage({
          id: "share.resource.mixed.alert",
          defaultMessage: "Cannot Share Resource",
        })}
      />
    );
  }

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "share.resource.title",
        defaultMessage: "Share Resource",
      })}
      widthClassName="w-160"
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={
        selectedList.length > 1
          ? intl.formatMessage(
              { id: "object.count", defaultMessage: "{num} objects" },
              { num: selectedList.length },
            )
          : selectedList[0]?.name
      }
    >
      <Form form={form}>
        <ShareResourceConfig form={form} isGroup={isGroup} />
      </Form>
    </DialogForm>
  );
};

export default Action;
