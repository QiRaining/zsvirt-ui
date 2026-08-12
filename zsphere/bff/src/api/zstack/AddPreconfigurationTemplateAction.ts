import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PreconfigurationTemplateInventory } from "./types";

@Injectable()
export class AddPreconfigurationTemplateAction extends ActionAdvance {
  async call(
    params: AddPreconfigurationTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddPreconfigurationTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddPreconfigurationTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/preconfigurations`,
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
    return this.postAction<AddPreconfigurationTemplateResult>(
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

export interface AddPreconfigurationTemplateActionParam {
  name: string;
  description?: string;
  distribution: string;
  type: string;
  content: string;
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

export interface AddPreconfigurationTemplateResult {
  inventory?: PreconfigurationTemplateInventory;
}
