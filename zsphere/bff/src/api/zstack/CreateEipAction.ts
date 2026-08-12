import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EipInventory } from "./types";

@Injectable()
export class CreateEipAction extends ActionAdvance {
  async call(
    params: CreateEipActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateEipResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateEipAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/eips`,
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
    return this.postAction<CreateEipResult>(
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

export interface CreateEipActionParam {
  name: string;
  description?: string;
  vipUuid: string;
  vmNicUuid?: string;
  usedIpUuid?: string;
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

export interface CreateEipResult {
  inventory?: EipInventory;
}
