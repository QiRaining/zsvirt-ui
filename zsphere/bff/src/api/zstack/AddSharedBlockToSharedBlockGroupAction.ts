import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SharedBlockGroupPrimaryStorageInventory } from "./types";

@Injectable()
export class AddSharedBlockToSharedBlockGroupAction extends ActionAdvance {
  async call(
    params: AddSharedBlockToSharedBlockGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSharedBlockToSharedBlockGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSharedBlockToSharedBlockGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/sharedblockgroup/${params.uuid}/sharedblocks`,
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
    return this.postAction<AddSharedBlockToSharedBlockGroupResult>(
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

export interface AddSharedBlockToSharedBlockGroupActionParam {
  diskUuid: string;
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddSharedBlockToSharedBlockGroupResult {
  inventory?: SharedBlockGroupPrimaryStorageInventory;
}
