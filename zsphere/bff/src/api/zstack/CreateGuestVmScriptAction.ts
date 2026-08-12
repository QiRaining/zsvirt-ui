import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { GuestVmScriptInventory } from "./types";

@Injectable()
export class CreateGuestVmScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: CreateGuestVmScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateGuestVmScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateGuestVmScriptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scripts`,
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
    return this.postAction<CreateGuestVmScriptResult>(
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

export interface CreateGuestVmScriptActionParam {
  name: string;
  description?: string;
  encodingType: string;
  scriptContent: string;
  renderParams?: string;
  platform: string;
  scriptType: string;
  scriptTimeout?: number;
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

export interface CreateGuestVmScriptResult {
  inventory?: GuestVmScriptInventory;
}
