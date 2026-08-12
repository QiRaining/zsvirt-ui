import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ReconnectConsoleProxyAgentAction extends ActionAdvance {
  async call(
    params: ReconnectConsoleProxyAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReconnectConsoleProxyAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReconnectConsoleProxyAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/consoles/agents`,
      {
        reconnectConsoleProxyAgent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReconnectConsoleProxyAgentResult>(
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

export interface ReconnectConsoleProxyAgentActionParam {
  agentUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReconnectConsoleProxyAgentResult {
  inventory?: any;
}
