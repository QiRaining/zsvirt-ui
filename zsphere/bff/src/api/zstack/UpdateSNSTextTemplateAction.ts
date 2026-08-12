import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSTextTemplateInventory } from "./types";

@Injectable()
export class UpdateSNSTextTemplateAction extends ActionAdvance {
  async call(
    params: UpdateSNSTextTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSTextTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSTextTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alarms/sns/text-templates/${params.uuid}/actions`,
      {
        updateSNSTextTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSNSTextTemplateResult>(
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

export interface UpdateSNSTextTemplateActionParam {
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

export interface UpdateSNSTextTemplateResult {
  inventory?: SNSTextTemplateInventory;
}
