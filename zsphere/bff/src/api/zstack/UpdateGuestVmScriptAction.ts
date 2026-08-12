import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { GuestVmScriptInventory } from "./types";

@Injectable()
export class UpdateGuestVmScriptAction extends ActionAdvance {
  // 使用 zsHttpService

  async call(
    params: UpdateGuestVmScriptActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateGuestVmScriptResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateGuestVmScriptAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scripts/${params.uuid}/actions`,
      {
        updateGuestVmScript: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateGuestVmScriptResult>(
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

export interface UpdateGuestVmScriptActionParam {
  uuid: string;
  name?: string;
  description?: string;
  encodingType?: string;
  scriptContent?: string;
  renderParams?: string;
  platform?: string;
  scriptType?: string;
  scriptTimeout?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateGuestVmScriptResult {
  inventory?: GuestVmScriptInventory;
}
