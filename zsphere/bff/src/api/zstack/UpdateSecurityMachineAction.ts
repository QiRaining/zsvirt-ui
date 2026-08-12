import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityMachineInventory } from "./types";

@Injectable()
export class UpdateSecurityMachineAction extends ActionAdvance {
  async call(
    params: UpdateSecurityMachineActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecurityMachineResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSecurityMachineAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-machines/${params.uuid}/actions`,
      {
        updateSecurityMachine: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSecurityMachineResult>(
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

export interface UpdateSecurityMachineActionParam {
  uuid: string;
  name?: string;
  description?: string;
  managementIp?: string;
  model?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSecurityMachineResult {
  inventory?: SecurityMachineInventory;
}
