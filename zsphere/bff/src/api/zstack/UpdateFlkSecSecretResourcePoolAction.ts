import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecretResourcePoolInventory } from "./types";

@Injectable()
export class UpdateFlkSecSecretResourcePoolAction extends ActionAdvance {
  async call(
    params: UpdateFlkSecSecretResourcePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecretResourcePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateFlkSecSecretResourcePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/secret-resource-pools/flkSec/${params.uuid}/actions`,
      {
        updateFlkSecSecretResourcePool: params,
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

export interface UpdateFlkSecSecretResourcePoolActionParam {
  encryptResult?: string;
  activatedToken?: string;
  protectToken?: string;
  hmacToken?: string;
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
