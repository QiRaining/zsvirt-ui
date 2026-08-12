import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  EmailEndPoint,
  EndPoint,
  ModifyAtPersonPayload,
  ModifyEmailAddressOfEndpointPayload,
  UpdateEndpointAllPayload,
  UpdateEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { normalizeEndpointLocale } from "../action/schema";
import type { IValuesByBaseConfig } from "./basic-config";
import BasicConfig from "./basic-config";

const Action: React.FC<IActionWrapperProps<EndPoint>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const updateEndpointAll = gql`
    mutation updateEndpointAll($input: UpdateEndpointAllInput!) {
      updateEndpointAll(input: $input) {
        actionId
      }
    }
  `;

  const onOk = useCallback(
    async (p: IValuesByBaseConfig) => {
      const { type, ...params } = p;
      const updateEndpointPayload: UpdateEndpointPayload = {
        uuid: selectedList?.[0]?.uuid,
        topicUuid: selectedList?.[0]?.topic?.uuid,
        name: params?.name,
        description: params?.description,
        locale: params?.locale,
      };

      const payload: UpdateEndpointAllPayload = {
        updateEndpointPayload,
      } as any;
      if (type === EndPointType.DingTalk) {
        const modifyDingTalkAtPersonPayload: ModifyAtPersonPayload = {
          endpointUuid: selectedList?.[0]?.uuid,
        };
        if (
          params?.addDingTalk?.atPersonList &&
          params?.addDingTalk?.atPersonList?.length > 0
        ) {
          modifyDingTalkAtPersonPayload.atPersonList =
            params?.addDingTalk?.atPersonList!.map((it) => {
              return {
                phoneNumber: `+${it.areaCode}-${it.phoneNumber}`,
                remark: it.remark,
              };
            });
        }
        payload.modifyDingTalkAtPersonPayload = modifyDingTalkAtPersonPayload;
        updateEndpointPayload.secret =
          params.addDingTalk?.securitySetting === "none"
            ? ""
            : params?.addDingTalk?.secret;
        updateEndpointPayload.atAll = params.addDingTalk?.object === "atAll";
      }
      if (type === EndPointType.FeiShu) {
        const modifyFeiShuAtPersonPayload: ModifyAtPersonPayload = {
          endpointUuid: selectedList?.[0]?.uuid,
        };
        if (
          params?.addFeiShu?.atPersonList &&
          params?.addFeiShu?.atPersonList?.length > 0
        ) {
          modifyFeiShuAtPersonPayload.atPersonList =
            params?.addFeiShu?.atPersonList!.map((it) => {
              return {
                userId: it.userId,
                remark: it.remark,
              };
            });
        }
        payload.modifyFeishuAtPersonPayload = modifyFeiShuAtPersonPayload;
        updateEndpointPayload.secret =
          params.addFeiShu?.securitySetting === "none"
            ? ""
            : params?.addFeiShu?.secret;
        updateEndpointPayload.atAll = params.addFeiShu?.object === "atAll";
      }
      if (type === EndPointType.WeCom) {
        const modifyWeComAtPersonPayload: ModifyAtPersonPayload = {
          endpointUuid: selectedList?.[0]?.uuid,
        };
        if (
          params?.addWeCom?.atPersonList &&
          params?.addWeCom?.atPersonList?.length > 0
        ) {
          modifyWeComAtPersonPayload.atPersonList =
            params?.addWeCom?.atPersonList!.map((it) => {
              return {
                userId: it.userId,
                remark: it.remark,
              };
            });
        }
        payload.modifyWecomAtPersonPayload = modifyWeComAtPersonPayload;
        updateEndpointPayload.atAll = params.addWeCom?.object === "atAll";
      }
      if (type === EndPointType.Email) {
        const modifyEmailAddressOfEndpointPayload: ModifyEmailAddressOfEndpointPayload =
          {
            endpointUuid: selectedList?.[0]?.uuid,
            oldEmailAddress: (
              (selectedList as EmailEndPoint[])?.[0].emailAddresses ?? []
            ).map((item) => {
              return {
                emailAddress: item.emailAddress,
                endpointUuid: item.endpointUuid,
                emailAddressUuid: item.uuid,
              };
            }),
            emailAddress: params.addEmail?.emails ?? [],
          };

        payload.modifyEmailAddressOfEndpointPayload =
          modifyEmailAddressOfEndpointPayload;
      }

      if (type === EndPointType.AliyunSms) {
        const modifySmsAtPersonPayload: ModifyAtPersonPayload = {
          endpointUuid: selectedList?.[0]?.uuid,
        };
        modifySmsAtPersonPayload.atPersonList =
          params?.addAliyunSms?.atPersonList!.map((it) => {
            return {
              phoneNumber: `+${it.areaCode}-${it.phoneNumber}`,
            };
          });
        payload.modifySmsAtPersonPayload = modifySmsAtPersonPayload;
      }

      if (type === EndPointType.SNMP) {
        payload.updateEndpointPayload!.platformUuid =
          params?.addSnmpTrap?.trapReceivers?.[0]?.uuid;
      }

      doAction({
        mutation: updateEndpointAll,
        payload,
        name: intl.formatMessage({
          id: "edit.zwatchEndpoint",
          defaultMessage: "Edit Endpoint",
        }),
        total: 1,
        type: "EndPoint",
      });
    },
    [doAction, intl],
  );
  const init = {
    ...selectedList?.[0],
    locale: normalizeEndpointLocale(selectedList?.[0]?.topic?.locale),
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ ...init });
    }
  }, [visible, init]);

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "modify.config",
        defaultMessage: "Modify Configuration",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
      onCancel={() => setVisible(false)}
      resourceName={selectedList?.[0]?.name}
    >
      <Form form={form} initialValues={init}>
        <BasicConfig init={init} form={form} />
      </Form>
    </DialogForm>
  );
};
export default Action;
