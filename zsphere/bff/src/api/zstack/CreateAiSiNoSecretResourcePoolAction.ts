import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecretResourcePoolInventory } from "./types";

@Injectable()
export class CreateAiSiNoSecretResourcePoolAction extends ActionAdvance {
  async call(
    params: CreateAiSiNoSecretResourcePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSecretResourcePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAiSiNoSecretResourcePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/secret-resource-pool/aisino`,
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

export interface CreateAiSiNoSecretResourcePoolActionParam {
  managementIp?: string;
  port?: number;
  route?: string;
  clientID?: string;
  clientSecrete?: string;
  appId?: string;
  keyNumSM2?: string;
  keyNumSM4?: string;
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
