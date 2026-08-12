import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/accesskey-management-local";
import { useAction } from "@zstack/zsphere-hooks";
import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { verifyStop, verifyStart } from "../action/validator";

const changeAccessKeyState = gql`
  mutation ($input: ChangeAccessKeyStateInput!) {
    changeAccessKeyState(input: $input) {
      actionId
    }
  }
`;
const createAccessKey = gql`
  mutation ($input: CreateAccessKeyInput!) {
    createAccessKey(input: $input) {
      actionId
    }
  }
`;

export const useEnableDisableBtnStyle = () => {
  return {
    enableBtnStyle: {
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
    },
    disableBtnStyle: {
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
    },
  } as any;
};

export default (refetch?: any) => {
  const intl = useIntl();
  const doAction = useAction();

  const { enableBtnStyle, disableBtnStyle } = useEnableDisableBtnStyle();

  const actionConfig = useActionConfig<IAccessKey>([
    {
      key: "create",
      primary: true,
      onClick: ({ setSelectedList }) => {
        doAction({
          mutation: createAccessKey,
          payload: {
            name: "",
          },
          name: intl.formatMessage({
            id: "accesskey.action.create",
            defaultMessage: "Generate AccessKey",
          }),
          type: "AccessKey",
          total: 1,
          onFinish: () => {
            refetch?.();
            setSelectedList?.([]);
          },
        });
      },
      autoInjectPreValidator: false,
    },
    {
      key: "start",
      ...enableBtnStyle,
      onClick: ({ selectedList, setSelectedList }) => {
        doAction({
          mutation: changeAccessKeyState,
          payload: selectedList.map((cv) => ({
            uuid: cv.uuid,
            stateEvent: "enable",
          })),
          name: intl.formatMessage({
            id: "accesskey.action.change.state.enable",
            defaultMessage: "Enable AccessKey",
          }),
          type: "AccessKey",
          total: selectedList.length,
          onFinish: () => {
            setSelectedList?.([]);
          },
        });
      },
      validators: [verifyStart],
    },
    {
      key: "stop",
      ...disableBtnStyle,
      ActionWrapper: require("../action/stop").default,
      validators: [verifyStop],
    },
    {
      key: "delete",
      ActionWrapper: require("../action/delete").default,
    },
  ]);
  return {
    ...actionConfig,
    getItemName: (item: IAccessKey) => item.AccessKeyID,
  };
};
