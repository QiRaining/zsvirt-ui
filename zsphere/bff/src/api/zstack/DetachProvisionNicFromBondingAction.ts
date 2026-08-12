import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BareMetal2InstanceInventory } from "./types";

@Injectable()
export class DetachProvisionNicFromBondingAction extends ActionAdvance {
  async call(
    params: DetachProvisionNicFromBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachProvisionNicFromBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachProvisionNicFromBondingAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/baremetal2/bm-instances/bm2-bondings/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachProvisionNicFromBondingResult>(
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

export interface DetachProvisionNicFromBondingActionParam {
  uuid: string;
  provisionNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachProvisionNicFromBondingResult {
  inventory?: BareMetal2InstanceInventory;
}
