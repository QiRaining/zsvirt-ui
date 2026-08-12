import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephPrimaryStoragePoolInventory } from "./types";

@Injectable()
export class AddCephPrimaryStoragePoolAction extends ActionAdvance {
  async call(
    params: AddCephPrimaryStoragePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddCephPrimaryStoragePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddCephPrimaryStoragePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/ceph/${params.primaryStorageUuid}/pools`,
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
    return this.postAction<AddCephPrimaryStoragePoolResult>(
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

export interface AddCephPrimaryStoragePoolActionParam {
  primaryStorageUuid: string;
  poolName: string;
  aliasName?: string;
  description?: string;
  type: string;
  isCreate?: boolean;
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

export interface AddCephPrimaryStoragePoolResult {
  inventory?: CephPrimaryStoragePoolInventory;
}
