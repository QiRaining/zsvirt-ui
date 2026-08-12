import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachGuestToolsIsoFromVmAction extends ActionAdvance {
  async call(
    params: DetachGuestToolsIsoFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachGuestToolsIsoFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachGuestToolsIsoFromVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.uuid}/actions`,
      {
        detachGuestToolsIsoFromVm: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachGuestToolsIsoFromVmResult>(
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

export interface DetachGuestToolsIsoFromVmActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachGuestToolsIsoFromVmResult {}
