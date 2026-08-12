import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephPrimaryStoragePoolInventory } from "./types";

@Injectable()
export class UpdateCephPrimaryStoragePoolAction extends ActionAdvance {
  async call(
    params: UpdateCephPrimaryStoragePoolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateCephPrimaryStoragePoolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateCephPrimaryStoragePoolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/ceph/pools/${params.uuid}/actions`,
      {
        updateCephPrimaryStoragePool: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateCephPrimaryStoragePoolResult>(
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

export interface UpdateCephPrimaryStoragePoolActionParam {
  uuid: string;
  aliasName?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateCephPrimaryStoragePoolResult {
  inventory?: CephPrimaryStoragePoolInventory;
}
