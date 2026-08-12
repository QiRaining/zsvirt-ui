import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SharedBlockGroupPrimaryStorageInventory } from "./types";

@Injectable()
export class RefreshSharedblockDeviceCapacityAction extends ActionAdvance {
  async call(
    params: RefreshSharedblockDeviceCapacityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshSharedBlockDeviceCapacityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshSharedblockDeviceCapacityAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/sharedblockgroup/${params.sharedBlockGroupUuid}/sharedblocks/${params.uuid}`,
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
    return this.postAction<RefreshSharedBlockDeviceCapacityResult>(
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

export interface RefreshSharedblockDeviceCapacityActionParam {
  uuid?: string;
  sharedBlockGroupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RefreshSharedBlockDeviceCapacityResult {
  inventory?: SharedBlockGroupPrimaryStorageInventory;
}
