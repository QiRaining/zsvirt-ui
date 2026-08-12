import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetLocalStorageHostDiskCapacityAction extends QueryAdvance {
  async call(
    params: GetLocalStorageHostDiskCapacityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetLocalStorageHostDiskCapacityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetLocalStorageHostDiskCapacityAction.name,
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
      "primaryStorageUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/primary-storage/local-storage/${params.primaryStorageUuid}/capacities${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetLocalStorageHostDiskCapacityResult>(
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

export interface GetLocalStorageHostDiskCapacityActionParam {
  hostUuid?: string;
  primaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetLocalStorageHostDiskCapacityResult {
  inventories?: any[];
}
