import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityMachineInventory } from "./types";

@Injectable()
export class ChangeSecurityMachineStateAction extends ActionAdvance {
  async call(
    params: ChangeSecurityMachineStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSecurityMachineStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSecurityMachineStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-machines/${params.uuid}/actions`,
      {
        changeSecurityMachineState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSecurityMachineStateResult>(
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

export interface ChangeSecurityMachineStateActionParam {
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

export interface ChangeSecurityMachineStateResult {
  inventory?: SecurityMachineInventory;
}
