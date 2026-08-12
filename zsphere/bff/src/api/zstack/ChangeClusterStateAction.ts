import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ClusterInventory } from "./types";

@Injectable()
export class ChangeClusterStateAction extends ActionAdvance {
  async call(
    params: ChangeClusterStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeClusterStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeClusterStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/clusters/${params.uuid}/actions`,
      {
        changeClusterState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeClusterStateResult>(
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

export interface ChangeClusterStateActionParam {
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

export interface ChangeClusterStateResult {
  inventory?: ClusterInventory;
}
