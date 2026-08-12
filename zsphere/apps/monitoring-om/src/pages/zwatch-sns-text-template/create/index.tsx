import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { get, omit } from "lodash-es";
import type { FC } from "react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  createAliyunSmsSNSTextTemplate,
  createSNSTextTemplate,
  updateAliyunSmsSNSTextTemplate,
  updateSNSTextTemplate,
} from "../../../gql/zwatch-sns-text-template.gql";
import { Platform, ZwatchSNSTextTemplateAlarmType } from "../constant";
import { _jsonParse, _jsonStringify } from "../helper";
import type { IValue } from "./basic-config";
import BasicConfig, { inititlValues } from "./basic-config";

export interface IFormData extends IValue {}

interface IProps {
  modalType?: "create" | "edit";
}

const Action: FC<IActionWrapperProps<SNSTextTemplate> & IProps> = ({
  visible,
  setVisible,
  selectedList,
  modalType = "create",
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const getMicrosoftTeamsTemplate = (temp: string | undefined) => {
    if (!temp) {
      return null;
    }
    temp = temp?.replace('"markdown": true', "");
    try {
      const _temp = get(JSON.parse(temp), ["sections", "0"]);
      delete _temp.markdown;
      return JSON.stringify(_temp, null, 2);
    } catch (e) {
      console.error(e);
    }
  };
  const init = useMemo(() => {
    if (modalType === "edit") {
      const item = selectedList?.[0];
      switch (item?.applicationPlatformType) {
        case Platform.Email:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              email: {
                subject: item?.subject,
                template: item?.template,
                recoverySubject: item?.recoverySubject,
                recoveryTemplate: item?.recoveryTemplate,
              },
            },
          };
        case Platform.DingTalk:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              dingTalk: {
                subject: item?.subject,
                template: item?.template,
                recoverySubject: item?.recoverySubject,
                recoveryTemplate: item?.recoveryTemplate,
              },
            },
          };
        case Platform.FeiShu:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              feishu: {
                subject: item?.subject,
                template: item?.template,
                recoverySubject: item?.recoverySubject,
                recoveryTemplate: item?.recoveryTemplate,
              },
            },
          };
        case Platform.WeCom:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              wecom: {
                subject: item?.subject,
                template: item?.template,
                recoverySubject: item?.recoverySubject,
                recoveryTemplate: item?.recoveryTemplate,
              },
            },
          };
        case Platform.HTTP:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              http: {
                subject: item?.subject,
                template: getMicrosoftTeamsTemplate(item?.template) ?? "",
                recoverySubject: item?.recoverySubject,
                recoveryTemplate:
                  getMicrosoftTeamsTemplate(item?.recoveryTemplate) ?? "",
              },
            },
          };
        case Platform.MicrosoftTeams:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                type: item?.type,
                applicationPlatformType: item?.applicationPlatformType,
                name: item?.name,
                description: item?.description,
              },
              microsoftTeams: {
                subject: item?.subject,
                template: item?.template,
                recoverySubject: item?.recoverySubject,
                recoveryTemplate: item?.recoveryTemplate,
              },
            },
          };
        default:
          return {
            zwatchSNSTextTemplate: {
              common: {
                defaultTemplate: item?.defaultTemplate,
                name: item?.name,
                description: item?.description,
                applicationPlatformType: item?.applicationPlatformType,
              },
              aliyunSms: {
                sign: item?.sign,
                template: item?.template,
                alarmTemplateCode: item?.alarmTemplateCode,
                eventTemplate: item?.eventTemplate,
                eventTemplateCode: item?.eventTemplateCode,
              },
            },
          };
      }
    }
    return null;
  }, [selectedList, modalType]);

  useEffect(() => {
    if (visible) {
      // 新建时 init 为 null，需用 inititlValues 避免清空表单导致后续空指针
      form.setFieldsValue(init ?? inititlValues);
    }
  }, [visible, init]);

  const title =
    modalType === "edit"
      ? intl.formatMessage({ id: "modify.config", defaultMessage: "Modify Configuration" })
      : intl.formatMessage({
          id: "create.messageTemplate",
          defaultMessage: "New Message Template",
        });

  const onOk = useCallback(
    async (formData) => {
      const { zwatchSNSTextTemplate } = formData as IValue;

      let { common }: any = zwatchSNSTextTemplate;
      const isEvent = common.type === ZwatchSNSTextTemplateAlarmType.Event;
      let currentApplicationPlatformType = Platform.Email;

      if (init) {
        // 编辑模板
        currentApplicationPlatformType = init.zwatchSNSTextTemplate?.common
          ?.applicationPlatformType as Platform;
        common = omit(common, ["type"]); // 编辑的时候不需要 type 字段
      } else {
        // 新建模板
        currentApplicationPlatformType = common.applicationPlatformType;
      }
      const genParamsMap: any = {
        [Platform.Email]: () => {
          const { email } = zwatchSNSTextTemplate;
          if (isEvent) {
            return {
              ...common,
              template: email?.template,
              subject: email?.subject,
            };
          }
          return {
            ...common,
            ...email,
          };
        },

        [Platform.DingTalk]: () => {
          const { dingTalk } = zwatchSNSTextTemplate;
          if (isEvent) {
            return {
              ...common,
              template: dingTalk?.template,
              subject: dingTalk?.subject,
            };
          }
          return {
            ...common,
            ...dingTalk,
          };
        },
        [Platform.WeCom]: () => {
          const { wecom } = zwatchSNSTextTemplate;
          if (isEvent) {
            return {
              ...common,
              template: wecom?.template,
              subject: wecom?.subject,
            };
          }
          return {
            ...common,
            ...wecom,
          };
        },
        [Platform.FeiShu]: () => {
          const { feishu } = zwatchSNSTextTemplate;
          if (isEvent) {
            return {
              ...common,
              template: feishu?.template,
              subject: feishu?.subject,
            };
          }
          return {
            ...common,
            ...feishu,
          };
        },
        [Platform.HTTP]: () => {
          const { http } = zwatchSNSTextTemplate;
          let _template = null;
          try {
            const template = http?.template ?? "";
            _template = {
              sections: [
                {
                  ..._jsonParse(template),
                },
              ],
            };
          } catch (e) {
            console.error(e);
          }

          if (isEvent) {
            return {
              ...common,
              template: _jsonStringify(_template),
              subject: http?.subject,
            };
          }

          let _recoveryTemplate = null;
          try {
            const recoveryTemplate = http?.recoveryTemplate ?? "";
            _recoveryTemplate = {
              sections: [
                {
                  ..._jsonParse(recoveryTemplate),
                },
              ],
            };
          } catch (e) {
            console.error(e);
          }

          return {
            ...common,
            template: _jsonStringify(_template),
            recoveryTemplate: _jsonStringify(_recoveryTemplate),
            subject: http?.subject,
            recoverySubject: http?.recoverySubject,
          };
        },

        [Platform.MicrosoftTeams]: () => {
          const { microsoftTeams } = zwatchSNSTextTemplate;
          let _template = null;
          try {
            const template = microsoftTeams?.template ?? "";
            _template = {
              "@type": "MessageCard",
              themeColor: "0076D7",
              summary: `Alarm details`,
              sections: [
                {
                  ..._jsonParse(template),
                  markdown: true,
                },
              ],
            };
          } catch (e) {
            console.error(e);
          }

          if (isEvent) {
            return {
              ...common,
              template: _jsonStringify(_template),
              subject: microsoftTeams?.subject,
            };
          }

          let _recoveryTemplate = null;
          try {
            const recoveryTemplate = microsoftTeams?.recoveryTemplate ?? "";
            _recoveryTemplate = {
              "@type": "MessageCard",
              themeColor: "0076D7",
              summary: `Alarm recovery details`,
              sections: [
                {
                  ..._jsonParse(recoveryTemplate),
                  markdown: true,
                },
              ],
            };
          } catch (e) {
            console.error(e);
          }

          return {
            ...common,
            template: _jsonStringify(_template),
            recoveryTemplate: _jsonStringify(_recoveryTemplate),
            subject: microsoftTeams?.subject,
            recoverySubject: microsoftTeams?.recoverySubject,
          };
        },

        [Platform.AliyunSms]: () => {
          const { aliyunSms } = zwatchSNSTextTemplate;
          return {
            ...common,
            ...aliyunSms,
          };
        },
      };

      const params = genParamsMap[currentApplicationPlatformType]();

      if (modalType === "edit") {
        doAction({
          mutation:
            currentApplicationPlatformType === Platform.AliyunSms
              ? updateAliyunSmsSNSTextTemplate
              : updateSNSTextTemplate,
          payload: { ...params, uuid: selectedList[0]?.uuid },
          name: intl.formatMessage({
            id: "modify.messageTemplate",
            defaultMessage: "Modify Message Template",
          }),
          total: selectedList.length,
          type: "SNSTextTemplate",
        });
        return;
      }
      doAction({
        mutation:
          currentApplicationPlatformType === Platform.AliyunSms
            ? createAliyunSmsSNSTextTemplate
            : createSNSTextTemplate,
        payload: {
          ...params,
        },
        name: intl.formatMessage({
          id: "create.messageTemplate",
          defaultMessage: "New Message Template",
        }),
        total: 1,
        type: "SNSTextTemplate",
      });
    },
    [doAction, intl, init, selectedList, modalType],
  );

  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
      onCancel={() => setVisible(false)}
      resourceName={modalType === "edit" ? selectedList[0]?.name : undefined}
    >
      <Form form={form} initialValues={init || inititlValues}>
        <BasicConfig init={init} form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
