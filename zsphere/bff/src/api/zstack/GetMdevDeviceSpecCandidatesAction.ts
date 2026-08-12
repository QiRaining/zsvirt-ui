import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetMdevDeviceSpecCandidatesAction extends QueryAdvance {
  async call(
    params: GetMdevDeviceSpecCandidatesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetMdevDeviceSpecCandidatesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetMdevDeviceSpecCandidatesAction.name,
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
      `/mdev-device-specs/candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetMdevDeviceSpecCandidatesResult>(
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

export interface GetMdevDeviceSpecCandidatesActionParam {
  clusterUuids?: any[];
  hostUuid?: string;
  vmInstanceUuid?: string;
  vmInstanceUuids?: any[];
  types?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetMdevDeviceSpecCandidatesResult {
  inventories?: any[];
}
