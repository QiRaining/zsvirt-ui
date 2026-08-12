import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ConsoleProxyAgentInventory } from "./types";

@Injectable()
export class UpdateConsoleProxyAgentAction extends ActionAdvance {
  async call(
    params: UpdateConsoleProxyAgentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateConsoleProxyAgentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateConsoleProxyAgentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/consoles/agents/${params.uuid}/actions`,
      {
        updateConsoleProxyAgent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateConsoleProxyAgentResult>(
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

export interface UpdateConsoleProxyAgentActionParam {
  uuid: string;
  consoleProxyOverriddenIp: string;
  consoleProxyPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateConsoleProxyAgentResult {
  inventory?: ConsoleProxyAgentInventory;
}
