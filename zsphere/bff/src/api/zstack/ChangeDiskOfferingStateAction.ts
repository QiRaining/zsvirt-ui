import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DiskOfferingInventory } from "./types";

@Injectable()
export class ChangeDiskOfferingStateAction extends ActionAdvance {
  async call(
    params: ChangeDiskOfferingStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeDiskOfferingStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeDiskOfferingStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/disk-offerings/${params.uuid}/actions`,
      {
        changeDiskOfferingState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeDiskOfferingStateResult>(
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

export interface ChangeDiskOfferingStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeDiskOfferingStateResult {
  inventory?: DiskOfferingInventory;
}
