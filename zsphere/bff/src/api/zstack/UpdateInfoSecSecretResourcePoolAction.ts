import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecretResourcePoolInventory } from "./types";

@Injectable()
export class UpdateInfoSecSecretResourcePoolAction extends ActionAdvance {
  async call(
    params: UpdateInfoSecSecretResourcePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecretResourcePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateInfoSecSecretResourcePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/secret-resource-pools/infoSec/${params.uuid}/actions`,
      {
        updateInfoSecSecretResourcePool: params,
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

export interface UpdateInfoSecSecretResourcePoolActionParam {
  connectionMode?: number;
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
