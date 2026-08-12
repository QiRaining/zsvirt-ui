import { DialogP3, DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ZsvRole as IZsvRole,
  DeleteRolePayload as IDeleteRolePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { deleteRole } from "../../../gql/role.gql";

const Action: React.FC<IActionWrapperProps<IZsvRole>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const currentRole = selectedList?.[0];
  const location = useLocation();
  const navigate = useNavigate();

  const onOk = async () => {
    setVisible(false);

    const payload: IDeleteRolePayload[] = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteRole,
      payload,
      name: intl.formatMessage({
        id: "virtualization.delete.role",
        defaultMessage: "Delete Role",
      }),
      total: 1,
      type: "Role",
      onFinish: () => {
        refetch?.();
        if (location.pathname?.includes("/role/detail")) {
          navigate(-1);
        }
      },
    });
  };

  const renderModalElement = () => {
    let modalElement = <></>;
    if (visible && (currentRole?.userCount || currentRole?.groupCount)) {
      modalElement = (
        <DialogWeak
          visible={visible}
          setVisible={setVisible}
          type="warning"
          title={intl.formatMessage({
            id: "delete.role.alert.message",
            defaultMessage: "Cannot Delete Role",
          })}
          onConfirm={() => {
            setVisible(false);
          }}
          description={
            <div>
              {intl.formatMessage({
                id: "delete.role.alert.description",
                defaultMessage: "To delete a role, unassign any users or user groups that are currently associated with the role.",
              })}
            </div>
          }
        />
      );
    } else {
      modalElement = (
        <DialogP3
          title={intl.formatMessage({
            id: "delete.role.title",
            defaultMessage: "Delete Role?",
          })}
          visible={visible}
          setVisible={setVisible}
          resourceType={intl.formatMessage({
            id: "role",
            defaultMessage: "Role",
          })}
          resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
          onConfirm={onOk}
        />
      );
    }

    return modalElement;
  };

  return renderModalElement();
};

export default Action;
