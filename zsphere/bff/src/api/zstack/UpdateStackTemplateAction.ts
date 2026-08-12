import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { StackTemplateInventory } from "./types";

@Injectable()
export class UpdateStackTemplateAction extends ActionAdvance {
  async call(
    params: UpdateStackTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateStackTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateStackTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/cloudformation/template/${params.uuid}/actions`,
      {
        updateStackTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateStackTemplateResult>(
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

export interface UpdateStackTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: boolean;
  templateContent?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateStackTemplateResult {
  inventory?: StackTemplateInventory;
}
