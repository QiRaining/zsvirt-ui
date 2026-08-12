import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { GuestVmScriptExecutedRecordInventory } from "./types";

@Injectable()
export class ExecuteGuestVmScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: ExecuteGuestVmScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExecuteGuestVmScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExecuteGuestVmScriptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scripts/${params.uuid}/actions`,
      {
        executeGuestVmScript: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExecuteGuestVmScriptResult>(
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

export interface ExecuteGuestVmScriptActionParam {
  uuid: string;
  vmInstanceUuids: any[];
  scriptTimeout?: number;
  logPath?: string;
  recordUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExecuteGuestVmScriptResult {
  inventory?: GuestVmScriptExecutedRecordInventory;
}
