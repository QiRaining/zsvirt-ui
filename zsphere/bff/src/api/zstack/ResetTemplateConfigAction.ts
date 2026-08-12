import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ResetTemplateConfigAction extends ActionAdvance {
  async call(
    params: ResetTemplateConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResetTemplateConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResetTemplateConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/template-configurations/${params.templateUuid}/actions`,
      {
        resetTemplateConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResetTemplateConfigResult>(
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

export interface ResetTemplateConfigActionParam {
  templateUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResetTemplateConfigResult {}
