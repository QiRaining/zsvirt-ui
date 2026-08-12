import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class AddBlockPrimaryStorageAction extends ActionAdvance {
  async call(
    params: AddBlockPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddBlockPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/block`,
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
    return this.postAction<AddPrimaryStorageResult>(
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

export interface AddBlockPrimaryStorageActionParam {
  vendorName: string;
  metadata: string;
  url: string;
  name: string;
  description?: string;
  type?: string;
  zoneUuid: string;
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

export interface AddPrimaryStorageResult {
  inventory?: PrimaryStorageInventory;
}
