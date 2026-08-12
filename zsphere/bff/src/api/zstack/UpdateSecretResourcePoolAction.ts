import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecretResourcePoolInventory } from "./types";

@Injectable()
export class UpdateSecretResourcePoolAction extends ActionAdvance {
  async call(
    params: UpdateSecretResourcePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecretResourcePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSecretResourcePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/secret-resource-pool/${params.uuid}/actions`,
      {
        updateSecretResourcePool: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSecretResourcePoolResult>(
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

export interface UpdateSecretResourcePoolActionParam {
  uuid: string;
  name?: string;
  description?: string;
  model?: string;
  heartbeatInterval?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSecretResourcePoolResult {
  inventory?: SecretResourcePoolInventory;
}
