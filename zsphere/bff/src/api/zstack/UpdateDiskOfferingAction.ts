import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DiskOfferingInventory } from "./types";

@Injectable()
export class UpdateDiskOfferingAction extends ActionAdvance {
  async call(
    params: UpdateDiskOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateDiskOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateDiskOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/disk-offerings/${params.uuid}/actions`,
      {
        updateDiskOffering: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateDiskOfferingResult>(
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

export interface UpdateDiskOfferingActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateDiskOfferingResult {
  inventory?: DiskOfferingInventory;
}
