import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class UpdateAffinityGroupAction extends ActionAdvance {
  async call(
    params: UpdateAffinityGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAffinityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAffinityGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/affinity-groups/${params.uuid}/actions`,
      {
        updateAffinityGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAffinityGroupResult>(
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

export interface UpdateAffinityGroupActionParam {
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

export interface UpdateAffinityGroupResult {
  inventory?: AffinityGroupInventory;
}
