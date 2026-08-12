import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class ChangeAffinityGroupStateAction extends ActionAdvance {
  async call(
    params: ChangeAffinityGroupStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeAffinityGroupStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeAffinityGroupStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/affinity-groups/${params.uuid}/actions`,
      {
        changeAffinityGroupState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeAffinityGroupStateResult>(
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

export interface ChangeAffinityGroupStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeAffinityGroupStateResult {
  inventory?: AffinityGroupInventory;
}
