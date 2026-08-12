import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetTrashOnPrimaryStorageAction extends QueryAdvance {
  async call(
    params: GetTrashOnPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetTrashOnPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetTrashOnPrimaryStorageAction.name,
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
      `/primary-storage/trash${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetTrashOnPrimaryStorageResult>(
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

export interface GetTrashOnPrimaryStorageActionParam {
  uuid: string;
  resourceUuid?: string;
  resourceType?: string;
  trashType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetTrashOnPrimaryStorageResult {
  inventories?: any[];
}
