import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/zwatch-endpoint";
import { useAction } from "@zstack/zsphere-hooks";
import type { EndPointType as IEndPointType } from "@zstack/zsphere-types";
import { StateEvent as IStateEvent } from "@zstack/zsphere-types";
import type { ChangeEndpointStatePayload as IChangeEndpointStatePayload } from "@zstack/zsphere-types/graphql";
import { filter, map } from "lodash-es";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import {
  verifyDelete,
  verifyEdit,
  verifyStart,
  verifyStop,
  verifyTestMessage,
} from "../action/validator";
import {
  verifyRemoveAlarm,
  verifySendTestMessage,
  verifySingleSelect,
} from "../action/validator";
import { supportedTestConnectEndPointType } from "../components";

export default () => {
  const intl = useIntl();

  const doAction = useAction();

  const changeEndpointState = gql`
    mutation changeSNSApplicationEndpoint($input: ChangeEndpointInput!) {
      changeSNSApplicationEndpoint(input: $input) {
        actionId
      }
    }
  `;
  const changeState = useCallback(
    async (state: IStateEvent, selectedList, setSelectedList, refetch) => {
      const nameMap = {
        [IStateEvent.enable]: intl.formatMessage({
          id: "enable.zwatchEndpoint",
          defaultMessage: "Enable Endpoint",
        }),
        [IStateEvent.disable]: intl.formatMessage({
          id: "disable.zwatchEndpoint",
          defaultMessage: "Disable Endpoint",
        }),
      };
      const filterValue =
        state === IStateEvent.disable ? "Enabled" : "Disabled";
      const uuids = map(filter(selectedList, ["state", filterValue]), "uuid");
      const payload: IChangeEndpointStatePayload[] = uuids.map((uuid) => {
        return { uuid, stateEvent: state };
      });
      doAction({
        mutation: changeEndpointState,
        payload,
        name: nameMap[state],
        total: payload.length,
        type: "EndPoint",
        onFinish: () => {
          setSelectedList?.([]);
          refetch?.();
        },
      });
    },
    [intl, doAction, changeEndpointState],
  );

  const config = useActionConfig([
    {
      key: "create.zwatchEndpoint",
      name: intl.formatMessage({
        id: "new.zwatchEndpoint",
        defaultMessage: "New Endpoint",
      }),
      autoInjectPreValidator: false,
      primary: true,
      onClick: null as any,
      ActionWrapper: require("../create/index").default,
    },
    {
      key: "remove.alarm",
      preValidators: [verifySingleSelect],
      validators: [verifyRemoveAlarm],
      ActionWrapper: require("../action/remove-alarm-drawer").default,
    },
    {
      key: "add.alarm",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/add-alarm-drawer").default,
    },
    {
      key: "enable",
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
      validators: [verifyStart],
      onClick: ({ selectedList, setSelectedList, refetch }) =>
        changeState(IStateEvent.enable, selectedList, setSelectedList, refetch),
    },
    {
      key: "disable",
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
      validators: [verifyStop],
      onClick: ({ selectedList, setSelectedList, refetch }) =>
        changeState(
          IStateEvent.disable,
          selectedList,
          setSelectedList,
          refetch,
        ),
    },
    {
      key: "edit.zsv",
      validators: [verifyEdit],
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/update-modal").default,
    },
    {
      key: "editConfig",
      validators: [verifyEdit],
      ActionWrapper: require("../modify").default,
    },
    {
      key: "add.in.alarm.resource",
      autoInjectPreValidator: false,
      ActionWrapper:
        require("zsv_shared/zwatch-alarm/resource/action/add-zwatch-endpoint-modal")
          .default,
    },
    {
      key: "add.in.alarm.event",
      autoInjectPreValidator: false,
      ActionWrapper:
        require("../../zwatch-alarm/event/action/add-zwatch-endpoint-modal")
          .default,
    },
    {
      key: "remove.in.alarm.resource",
      ActionWrapper: require("../action/remove-in-alarm-resource-modal")
        .default,
    },
    {
      key: "remove.in.alarm.event",
      ActionWrapper: require("../action/remove-in-alarm-event-modal").default,
    },
    {
      key: "remove.endpoint.in.resource.row",
      ActionWrapper: require("../action/remove-in-alarm-resource-modal")
        .default,
    },
    {
      key: "remove.endpoint.in.event.row",
      ActionWrapper: require("../action/remove-in-alarm-event-modal").default,
    },
    {
      key: "send.testMsg",
      ActionWrapper: require("../action/send-test-msg").default,
      preValidators: [verifySingleSelect],
      validators: [verifySendTestMessage],
      tooltip: ({ selectedList }) => {
        if (selectedList && selectedList[0]) {
          if (
            !supportedTestConnectEndPointType.includes(
              selectedList[0].type as IEndPointType,
            )
          ) {
            return {
              title: intl.formatMessage({
                id: "zwatch.endpoint.send_test_msg.disabled_tooltip",
                defaultMessage:
                  "You can send a test message only to a DingTalk, WeCom, Lark, or SNMP Trap receiver endpoint.",
              }),
            };
          }
        }
      },
    },
    {
      key: "test.message",
      ActionWrapper: require("../action/test-message").default,
      preValidators: [verifySingleSelect],
      validators: [verifyTestMessage],
      trigger: "hide",
    },
    {
      key: "delete",
      preValidators: [verifyDelete],
      ActionWrapper: require("../action/delete-modal").default,
    },
  ]);
  return config;
};
