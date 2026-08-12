import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DiskOfferingInventory } from "./types";

@Injectable()
export class CreateDiskOfferingAction extends ActionAdvance {
  async call(
    params: CreateDiskOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDiskOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDiskOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/disk-offerings`,
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
    return this.postAction<CreateDiskOfferingResult>(
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

export interface CreateDiskOfferingActionParam {
  name: string;
  description?: string;
  diskSize: number;
  sortKey?: number;
  allocationStrategy?: string;
  type?: string;
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

export interface CreateDiskOfferingResult {
  inventory?: DiskOfferingInventory;
}
