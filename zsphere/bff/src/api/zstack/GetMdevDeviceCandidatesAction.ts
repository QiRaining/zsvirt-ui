import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetMdevDeviceCandidatesAction extends QueryAdvance {
  async call(
    params: GetMdevDeviceCandidatesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetMdevDeviceCandidatesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetMdevDeviceCandidatesAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/mdev-devices/candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetMdevDeviceCandidatesResult>(
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

export interface GetMdevDeviceCandidatesActionParam {
  clusterUuids?: any[];
  hostUuid?: string;
  vmInstanceUuid?: string;
  types?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetMdevDeviceCandidatesResult {
  inventories?: any[];
}
