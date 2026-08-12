import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmNicInventory } from "./types";

@Injectable()
export class ChangeVmNicTypeAction extends ActionAdvance {
  async call(
    params: ChangeVmNicTypeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVmNicTypeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVmNicTypeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/nics/${params.vmNicUuid}/actions`,
      {
        changeVmNicType: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeVmNicTypeResult>(
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

export interface ChangeVmNicTypeActionParam {
  vmNicUuid: string;
  vmNicType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeVmNicTypeResult {
  inventory?: VmNicInventory;
}
