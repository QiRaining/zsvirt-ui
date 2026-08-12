import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SnmpAgentInventory } from "./types";

@Injectable()
export class StartSnmpAgentAction extends ActionAdvance {
  async call(
    params: StartSnmpAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<StartSnmpAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      StartSnmpAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/snmp/agent/actions`,
      {
        startSnmpAgent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<StartSnmpAgentResult>(
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

export interface StartSnmpAgentActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface StartSnmpAgentResult {
  inventory?: SnmpAgentInventory;
}
