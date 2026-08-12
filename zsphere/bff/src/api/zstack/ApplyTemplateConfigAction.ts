import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ApplyTemplateConfigAction extends ActionAdvance {
  async call(
    params: ApplyTemplateConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ApplyTemplateConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ApplyTemplateConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/template-configurations/${params.templateUuid}/actions`,
      {
        applyTemplateConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ApplyTemplateConfigResult>(
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

export interface ApplyTemplateConfigActionParam {
  templateUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ApplyTemplateConfigResult {}
