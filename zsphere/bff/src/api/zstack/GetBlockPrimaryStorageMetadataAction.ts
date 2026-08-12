import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetBlockPrimaryStorageMetadataAction extends ActionAdvance {
  async call(
    params: GetBlockPrimaryStorageMetadataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryBlockPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetBlockPrimaryStorageMetadataAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/block/metadata`,
      {
        param: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryBlockPrimaryStorageResult>(
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

export interface GetBlockPrimaryStorageMetadataActionParam {
  vendorName: string;
  metadata: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface QueryBlockPrimaryStorageResult {
  inventories?: any[];
  total?: number;
}
