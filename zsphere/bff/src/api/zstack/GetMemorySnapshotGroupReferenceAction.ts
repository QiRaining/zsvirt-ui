import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetMemorySnapshotGroupReferenceAction extends QueryAdvance {
  async call(
    params: GetMemorySnapshotGroupReferenceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetMemorySnapshotGroupReferenceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetMemorySnapshotGroupReferenceAction.name,
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
      `/memory-snapshots/group/reference${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetMemorySnapshotGroupReferenceResult>(
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

export interface GetMemorySnapshotGroupReferenceActionParam {
  resourceUuid: string;
  resourceType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetMemorySnapshotGroupReferenceResult {
  inventories?: any[];
  resourceUuid?: string;
}
