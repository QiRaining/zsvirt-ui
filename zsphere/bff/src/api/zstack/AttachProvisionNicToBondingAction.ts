import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BareMetal2InstanceInventory } from "./types";

@Injectable()
export class AttachProvisionNicToBondingAction extends ActionAdvance {
  async call(
    params: AttachProvisionNicToBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachProvisionNicToBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachProvisionNicToBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal2/bm-instances/${params.uuid}/bm2-bondings/${params.bondingUuid}`,
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
    return this.postAction<AttachProvisionNicToBondingResult>(
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

export interface AttachProvisionNicToBondingActionParam {
  uuid: string;
  provisionNicUuid: string;
  bondingUuid: string;
  provisionIp?: string;
  customMac?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachProvisionNicToBondingResult {
  inventory?: BareMetal2InstanceInventory;
}
