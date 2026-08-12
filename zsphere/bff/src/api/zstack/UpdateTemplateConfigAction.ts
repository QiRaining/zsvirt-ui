import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TemplateConfigInventory } from "./types";

@Injectable()
export class UpdateTemplateConfigAction extends ActionAdvance {
  async call(
    params: UpdateTemplateConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateTemplateConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateTemplateConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/template-configurations/${params.templateUuid}/actions`,
      {
        updateTemplateConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateTemplateConfigResult>(
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

export interface UpdateTemplateConfigActionParam {
  templateUuid: string;
  category: string;
  name: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateTemplateConfigResult {
  inventory?: TemplateConfigInventory;
}
