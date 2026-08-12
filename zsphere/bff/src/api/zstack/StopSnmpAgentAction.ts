import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SnmpAgentInventory } from "./types";

@Injectable()
export class StopSnmpAgentAction extends ActionAdvance {
  async call(
    params: StopSnmpAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<StopSnmpAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      StopSnmpAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/snmp/agent/actions`,
      {
        stopSnmpAgent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<StopSnmpAgentResult>(
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

export interface StopSnmpAgentActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface StopSnmpAgentResult {
  inventory?: SnmpAgentInventory;
}
