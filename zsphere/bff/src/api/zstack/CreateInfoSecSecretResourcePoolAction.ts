import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecretResourcePoolInventory } from "./types";

@Injectable()
export class CreateInfoSecSecretResourcePoolAction extends ActionAdvance {
  async call(
    params: CreateInfoSecSecretResourcePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSecretResourcePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateInfoSecSecretResourcePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/secret-resource-pool/infoSec`,
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
    return this.postAction<CreateSecretResourcePoolResult>(
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

export interface CreateInfoSecSecretResourcePoolActionParam {
  connectionMode: number;
  name: string;
  description?: string;
  model?: string;
  type: string;
  heartbeatInterval: number;
  zoneUuid: string;
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

export interface CreateSecretResourcePoolResult {
  inventory?: SecretResourcePoolInventory;
}
