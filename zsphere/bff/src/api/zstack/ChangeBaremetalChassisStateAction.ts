import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalChassisInventory } from "./types";

@Injectable()
export class ChangeBaremetalChassisStateAction extends ActionAdvance {
  async call(
    params: ChangeBaremetalChassisStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeBaremetalChassisStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeBaremetalChassisStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.uuid}/actions`,
      {
        changeBaremetalChassisState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeBaremetalChassisStateResult>(
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

export interface ChangeBaremetalChassisStateActionParam {
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

export interface ChangeBaremetalChassisStateResult {
  inventory?: BaremetalChassisInventory;
}
