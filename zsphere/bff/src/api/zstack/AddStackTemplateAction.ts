import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { StackTemplateInventory } from "./types";

@Injectable()
export class AddStackTemplateAction extends ActionAdvance {
  async call(
    params: AddStackTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddStackTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddStackTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/cloudformation/template`,
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
    return this.postAction<AddStackTemplateResult>(
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

export interface AddStackTemplateActionParam {
  name: string;
  description?: string;
  type?: string;
  templateContent?: string;
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

export interface AddStackTemplateResult {
  inventory?: StackTemplateInventory;
}
