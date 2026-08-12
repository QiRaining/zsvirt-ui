import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityMachineInventory } from "./types";

@Injectable()
export class AddFlkSecSecurityMachineAction extends ActionAdvance {
  async call(
    params: AddFlkSecSecurityMachineActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSecurityMachineResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddFlkSecSecurityMachineAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-machine/flkSec`,
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
    return this.postAction<AddSecurityMachineResult>(
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

export interface AddFlkSecSecurityMachineActionParam {
  port: number;
  name: string;
  description?: string;
  managementIp: string;
  model: string;
  type: string;
  zoneUuid: string;
  secretResourcePoolUuid: string;
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

export interface AddSecurityMachineResult {
  inventory?: SecurityMachineInventory;
}
