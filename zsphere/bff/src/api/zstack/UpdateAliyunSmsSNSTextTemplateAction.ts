import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AliyunSmsSNSTextTemplateInventory } from "./types";

@Injectable()
export class UpdateAliyunSmsSNSTextTemplateAction extends ActionAdvance {
  async call(
    params: UpdateAliyunSmsSNSTextTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAliyunSmsSNSTextTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAliyunSmsSNSTextTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alarms/sns/text-templates/${params.uuid}/actions`,
      {
        updateAliyunSmsSNSTextTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAliyunSmsSNSTextTemplateResult>(
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

export interface UpdateAliyunSmsSNSTextTemplateActionParam {
  alarmTemplateCode?: string;
  sign?: string;
  eventTemplateCode?: string;
  eventTemplate?: string;
  uuid: string;
  name?: string;
  description?: string;
  subject?: string;
  recoverySubject?: string;
  template?: string;
  recoveryTemplate?: string;
  defaultTemplate?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAliyunSmsSNSTextTemplateResult {
  inventory?: AliyunSmsSNSTextTemplateInventory;
}
