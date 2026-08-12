import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PortMirrorSessionInventory } from "./types";

@Injectable()
export class CreatePortMirrorSessionAction extends ActionAdvance {
  async call(
    params: CreatePortMirrorSessionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreatePortMirrorSessionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreatePortMirrorSessionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/port-mirrors/sessions`,
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
    return this.postAction<CreatePortMirrorSessionResult>(
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

export interface CreatePortMirrorSessionActionParam {
  portMirrorUuid: string;
  name: string;
  description?: string;
  type: string;
  srcEndPoint: string;
  dstEndPoint: string;
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

export interface CreatePortMirrorSessionResult {
  inventory?: PortMirrorSessionInventory;
}
