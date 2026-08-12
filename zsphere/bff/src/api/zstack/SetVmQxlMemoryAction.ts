import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetVmQxlMemoryAction extends ActionAdvance {
  async call(
    params: SetVmQxlMemoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVmQxlMemoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVmQxlMemoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        setVmQxlMemory: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVmQxlMemoryResult>(
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

export interface SetVmQxlMemoryActionParam {
  uuid: string;
  ram?: number;
  vram?: number;
  vgamem?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVmQxlMemoryResult {}
