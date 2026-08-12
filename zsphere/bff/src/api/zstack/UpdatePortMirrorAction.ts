import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PortMirrorInventory } from "./types";

@Injectable()
export class UpdatePortMirrorAction extends ActionAdvance {
  async call(
    params: UpdatePortMirrorActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdatePortMirrorResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdatePortMirrorAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/port-mirrors/${params.uuid}/actions`,
      {
        updatePortMirror: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdatePortMirrorResult>(
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

export interface UpdatePortMirrorActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdatePortMirrorResult {
  inventory?: PortMirrorInventory;
}
