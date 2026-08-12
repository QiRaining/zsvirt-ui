import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class CreateAffinityGroupAction extends ActionAdvance {
  async call(
    params: CreateAffinityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAffinityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAffinityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/affinity-groups`,
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
    return this.postAction<CreateAffinityGroupResult>(
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

export interface CreateAffinityGroupActionParam {
  name: string;
  description?: string;
  policy?: string;
  type?: string;
  zoneUuid?: string;
  subType?: string;
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

export interface CreateAffinityGroupResult {
  inventory?: AffinityGroupInventory;
}
