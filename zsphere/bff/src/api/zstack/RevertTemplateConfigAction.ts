import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevertTemplateConfigAction extends ActionAdvance {
  async call(
    params: RevertTemplateConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevertTemplateConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevertTemplateConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/template-configurations/${params.templateUuid}/actions`,
      {
        revertTemplateConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevertTemplateConfigResult>(
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

export interface RevertTemplateConfigActionParam {
  templateUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevertTemplateConfigResult {}
