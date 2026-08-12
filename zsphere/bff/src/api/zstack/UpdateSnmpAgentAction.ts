import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SnmpAgentInventory } from "./types";

@Injectable()
export class UpdateSnmpAgentAction extends ActionAdvance {
  async call(
    params: UpdateSnmpAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSnmpAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSnmpAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/snmp/agent/actions`,
      {
        updateSnmpAgent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSnmpAgentResult>(
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

export interface UpdateSnmpAgentActionParam {
  uuid: string;
  version: string;
  readCommunity?: string;
  userName?: string;
  authAlgorithm?: string;
  authPassword?: string;
  privacyAlgorithm?: string;
  privacyPassword?: string;
  port: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSnmpAgentResult {
  inventory?: SnmpAgentInventory;
}
