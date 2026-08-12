import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PortMirrorInventory } from "./types";

@Injectable()
export class CreatePortMirrorAction extends ActionAdvance {
  async call(
    params: CreatePortMirrorActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreatePortMirrorResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreatePortMirrorAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/port-mirrors`,
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
    return this.postAction<CreatePortMirrorResult>(
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

export interface CreatePortMirrorActionParam {
  mirrorNetworkUuid: string;
  name?: string;
  description?: string;
  stateEvent?: string;
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

export interface CreatePortMirrorResult {
  inventory?: PortMirrorInventory;
}
