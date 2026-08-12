import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSTextTemplateInventory } from "./types";

@Injectable()
export class CreateAliyunSmsSNSTextTemplateAction extends ActionAdvance {
  async call(
    params: CreateAliyunSmsSNSTextTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSTextTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAliyunSmsSNSTextTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/alarms/sns/text-templates/aliyun-sms`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CreateSNSTextTemplateResult>(
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
      httpRequestPromise,
      needRecord,
      apiRecord,
    );
  }
}

export interface CreateAliyunSmsSNSTextTemplateActionParam {
  sign: string;
  alarmTemplateCode: string;
  eventTemplateCode: string;
  eventTemplate?: string;
  name: string;
  description?: string;
  applicationPlatformType: string;
  subject?: string;
  recoverySubject?: string;
  template: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  type?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateSNSTextTemplateResult {
  inventory?: SNSTextTemplateInventory;
}
