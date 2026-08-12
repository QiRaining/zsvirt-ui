import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SnmpAgentInventory } from "./types";

@Injectable()
export class CreateSnmpAgentAction extends ActionAdvance {
  async call(
    params: CreateSnmpAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSnmpAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSnmpAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/snmp/agent`,
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
    return this.postAction<CreateSnmpAgentResult>(
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

export interface CreateSnmpAgentActionParam {
  version: string;
  readCommunity?: string;
  userName?: string;
  authAlgorithm?: string;
  authPassword?: string;
  privacyAlgorithm?: string;
  privacyPassword?: string;
  port: number;
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

export interface CreateSnmpAgentResult {
  inventory?: SnmpAgentInventory;
}
