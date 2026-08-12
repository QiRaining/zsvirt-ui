import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PreconfigurationTemplateInventory } from "./types";

@Injectable()
export class UpdatePreconfigurationTemplateAction extends ActionAdvance {
  async call(
    params: UpdatePreconfigurationTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdatePreconfigurationTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdatePreconfigurationTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/preconfigurations/${params.uuid}/actions`,
      {
        updatePreconfigurationTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdatePreconfigurationTemplateResult>(
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

export interface UpdatePreconfigurationTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  distribution?: string;
  type?: string;
  content?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdatePreconfigurationTemplateResult {
  inventory?: PreconfigurationTemplateInventory;
}
