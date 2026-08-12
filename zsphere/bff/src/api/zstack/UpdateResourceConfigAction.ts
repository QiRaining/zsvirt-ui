import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ResourceConfigInventory } from "./types";

@Injectable()
export class UpdateResourceConfigAction extends ActionAdvance {
  async call(
    params: UpdateResourceConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateResourceConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateResourceConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/resource-configurations/${params.category}/${params.name}/${params.resourceUuid}/actions`,
      {
        updateResourceConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateResourceConfigResult>(
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

export interface UpdateResourceConfigActionParam {
  category: string;
  name: string;
  resourceUuid: string;
  value: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateResourceConfigResult {
  inventory?: ResourceConfigInventory;
}
