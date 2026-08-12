import { gql } from "@apollo/client";
import { Button, DialogFooter, Tooltip } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  CreateAliyunSmsEndpointAndAccesskeyPayload,
  CreateDingTalkEndpointPayload,
  CreateFeiShuEndpointPayload,
  CreateWeComEndpointPayload,
  EndPoint,
} from "@zstack/zsphere-types/graphql";
import { reduce } from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { getDefaultEndpointLocale } from "../action/schema";
import type { IValuesByBaseConfig } from "./basic-config";
import BasicConfig from "./basic-config";

const Action: React.FC<IActionWrapperProps<EndPoint>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [canSubmit, setCanSubmit] = React.useState(false);

  // ZSTAC-54399, 创建邮箱、短信、钉钉指定成员时，默认展示一个输入框
  const initialValuesByBasicConfig: IValuesByBaseConfig = useMemo(() => {
    return {
      name: "",
      description: "",
      type: EndPointType.Email,
      addEmail: {
        emails: [""],
      },
      addSms: {
        accessKey: [],
        receivers: [
          {
            areaCode: "86",
            phoneNumber: "",
          },
        ],
      },
      addDingTalk: {
        object: "none",
        url: "",
      },
      addFeiShu: {
        url: "",
        object: "none",
      },
      addWeCom: {
        url: "",
        object: "none",
      },
      locale: getDefaultEndpointLocale(intl.locale),
    };
  }, [intl]);

  const createEmailEndpoint = gql`
    mutation createEmailEndpoint($input: CreateEmailEndpointInput!) {
      createEmailEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const createAliyunSmsEndpoint = gql`
    mutation createAliyunSmsEndpointAndAccesskey(
      $input: CreateAliyunSmsEndpointAndAccesskeyInput!
    ) {
      createAliyunSmsEndpointAndAccesskey(input: $input) {
        actionId
      }
    }
  `;

  const createHttpEndpoint = gql`
    mutation createHttpEndpoint($input: CreateHttpEndpointInput!) {
      createHttpEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const createDingTalkEndpoint = gql`
    mutation createDingTalkEndpoint($input: CreateDingTalkEndpointInput!) {
      createDingTalkEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const createSNSMicrosoftTeamsEndpoint = gql`
    mutation createSNSMicrosoftTeamsEndpoint(
      $input: CreateSNSMicrosoftTeamsEndpointInput!
    ) {
      createSNSMicrosoftTeamsEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const createFeiShuEndpoint = gql`
    mutation createFeiShuEndpoint($input: CreateFeiShuEndpointInput!) {
      createFeiShuEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const createWeComEndpoint = gql`
    mutation createWeComEndpoint($input: CreateWeComEndpointInput!) {
      createWeComEndpoint(input: $input) {
        actionId
      }
    }
  `;
  const createSnmpTrapEndpoint = gql`
    mutation createSnmpTrapEndpoint($input: CreateSnmpTrapEndpointInput!) {
      createSnmpTrapEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const transformAddEmail = (formData: IValuesByBaseConfig) => {
    const { name, description, addEmail, locale } = formData;
    const params = {
      name,
      description,
      emails: addEmail?.emails,
      platformUuid: addEmail?.platform?.[0]?.uuid,
      locale,
    };
    return params;
  };

  const transformAddSms = (formData: IValuesByBaseConfig) => {
    const { name, description, addAliyunSms } = formData;
    const params: CreateAliyunSmsEndpointAndAccesskeyPayload = {
      name,
      description,
      receivers: addAliyunSms?.atPersonList?.map(
        (item) => `+${item?.areaCode}-${item?.phoneNumber}`,
      ),
      accessKey: addAliyunSms?.accessKey ?? "",
      secret: addAliyunSms?.secret ?? "",
    };
    return params;
  };

  const transformAddDingTalk = (formData: IValuesByBaseConfig) => {
    const { name, description, addDingTalk, locale } = formData;

    const params: CreateDingTalkEndpointPayload = {
      name,
      description,
      atAll: addDingTalk?.object === "atAll",
      url: addDingTalk?.url || "",
      secret: addDingTalk?.secret || "",
      locale,
    };

    if (addDingTalk?.object === "atPerson") {
      try {
        params.atPersonPhoneNumbers = addDingTalk?.atPersonList?.map(
          (item) => `+${item?.areaCode}-${item?.phoneNumber}`,
        );
        params.atPersonList = JSON.stringify(
          reduce(
            addDingTalk?.atPersonList || [],
            (result: any, current) => {
              result[`+${current?.areaCode}-${current?.phoneNumber}`] =
                current.remark;

              return result;
            },
            {},
          ),
        );
      } catch {}
    }

    return params;
  };

  const transformAddHttp = (formData: IValuesByBaseConfig) => {
    const { name, description, addHttp } = formData;
    const params = {
      name,
      description,
      ...addHttp,
    };
    return params;
  };

  const transformAddMicroTeams = (formData: IValuesByBaseConfig) => {
    const { name, description, addMicroTeams, locale } = formData;
    const params = {
      name,
      description,
      ...addMicroTeams,
      locale,
    };
    return params;
  };
  const transformAddFeiShu = (formData: IValuesByBaseConfig) => {
    const { name, description, addFeiShu, locale } = formData;
    const params: CreateFeiShuEndpointPayload = {
      name,
      description,
      locale,
      secret: addFeiShu!.secret || "",
      url: addFeiShu!.url,
    };

    switch (addFeiShu!.object) {
      // 指定人
      case "atPerson":
        try {
          params.atPersonUserIds =
            addFeiShu!.atPersonList?.map((item) => item.userId) || [];
          params.atPersonList = JSON.stringify(
            reduce(
              addFeiShu!.atPersonList || [],
              (result: any, item) => {
                result[item.userId] = item.remark;

                return result;
              },
              {},
            ),
          );
        } catch {}

        break;
      // 所有人
      case "atAll":
        params.atAll = true;
        break;
      // 无指定, 不传递 atAll 和 atPersonUserIds 参数
      default:
    }

    return params;
  };

  const transformAddWecom = (formData: IValuesByBaseConfig) => {
    const { name, description, addWeCom, locale } = formData;
    const params: CreateWeComEndpointPayload = {
      name,
      description,
      url: addWeCom!.url,
      locale,
    };

    switch (addWeCom!.object) {
      // 指定人
      case "atPerson":
        try {
          params.atPersonUserIds =
            addWeCom!.atPersonList?.map((item) => item.userId) || [];
          params.atPersonList = JSON.stringify(
            reduce(
              addWeCom!.atPersonList || [],
              (result: any, item) => {
                result[item.userId] = item.remark;

                return result;
              },
              {},
            ),
          );
        } catch {}

        break;
      // 所有人
      case "atAll":
        params.atAll = true;
        break;
      // 无指定,不传递 atAll 和 atPersonUserIds 参数
      default:
    }

    return params;
  };

  const transformAddSnmpTrap = (formData: IValuesByBaseConfig) => {
    const { name, description, addSnmpTrap, locale } = formData;
    const params = {
      name,
      description,
      platformUuid: addSnmpTrap?.trapReceivers?.map((it) => it?.uuid)?.[0],
      locale,
    };
    return params;
  };

  const onOk = useCallback(
    async (p: IValuesByBaseConfig) => {
      const { type, ...params } = p;
      const transform: Function = (formData: any) => {
        try {
          switch (type) {
            case EndPointType.Email:
              return { formData: transformAddEmail(formData) };
            case EndPointType.AliyunSms:
              return { formData: transformAddSms(formData) };
            case EndPointType.DingTalk:
              return { formData: transformAddDingTalk(formData) };
            case EndPointType.HTTP:
              return { formData: transformAddHttp(formData) };
            case EndPointType.MicrosoftTeams:
              return { formData: transformAddMicroTeams(formData) };
            case EndPointType.FeiShu:
              return { formData: transformAddFeiShu(formData) };
            case EndPointType.WeCom:
              return { formData: transformAddWecom(formData) };
            case EndPointType.SNMP:
              return { formData: transformAddSnmpTrap(formData) };
            default:
              return { ...formData };
          }
        } catch (e) {
          console.log(e);
        }
      };
      const { formData } = transform(params);
      let actionName;
      switch (type) {
        case EndPointType.Email:
          actionName = createEmailEndpoint;
          break;
        case EndPointType.AliyunSms:
          actionName = createAliyunSmsEndpoint;
          break;
        case EndPointType.HTTP:
          actionName = createHttpEndpoint;
          break;
        case EndPointType.DingTalk:
          actionName = createDingTalkEndpoint;
          break;
        case EndPointType.MicrosoftTeams:
          actionName = createSNSMicrosoftTeamsEndpoint;
          break;
        case EndPointType.FeiShu:
          actionName = createFeiShuEndpoint;
          break;
        case EndPointType.WeCom:
          actionName = createWeComEndpoint;
          break;
        case EndPointType.SNMP:
          actionName = createSnmpTrapEndpoint;
          break;
        default:
          actionName = createEmailEndpoint;
          break;
      }
      doAction({
        mutation: actionName,
        payload: { ...formData },
        name: intl.formatMessage({
          id: "create.zwatchEndpoint",
          defaultMessage: "New Endpoint",
        }),
        total: 1,
        type: "EndPoint",
        onProgress: (result: ITaskResult) => {
          console.log("onProgress:", result);
        },
      });
      setVisible(false);
    },
    [doAction, intl],
  );

  const footer = useMemo(() => {
    // 目的是按钮禁用时补充 tootip 显示
    return (
      <DialogFooter className="gap-2">
        <Button
          variant="subtle"
          onClick={() => {
            setVisible(false);
          }}
        >
          {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
        </Button>
        {canSubmit ? (
          <Button
            onClick={() => {
              form.validateFields().then(() => {
                onOk(form.getFieldsValue());
              });
            }}
            variant="primary"
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        ) : (
          <Tooltip
            title={intl.formatMessage({
              id: "zwatch.endpoint.before_create_tooltip",
              defaultMessage: "Click Send Test Message first.",
            })}
          >
            <Button
              disabled={!canSubmit}
              variant="primary"
              onClick={() => onOk(form.getFieldsValue())}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </Tooltip>
        )}
      </DialogFooter>
    );
  }, [form, intl, onOk, setVisible, canSubmit]);

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "new.zwatchEndpoint",
        defaultMessage: "New Endpoint",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      footer={footer}
      // onOk={()=>onOk(form.getFieldsValue())}
      // onCancel={() => setVisible(false)}
    >
      <Form
        form={form}
        initialValues={initialValuesByBasicConfig}
        preserve={false}
      >
        <BasicConfig form={form} setCanSubmit={setCanSubmit} />
      </Form>
    </DialogForm>
  );
};
export default Action;
