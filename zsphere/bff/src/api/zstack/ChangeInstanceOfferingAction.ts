import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class ChangeInstanceOfferingAction extends ActionAdvance {
  async call(
    params: ChangeInstanceOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeInstanceOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeInstanceOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/actions`,
      {
        changeInstanceOffering: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeInstanceOfferingResult>(
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

export interface ChangeInstanceOfferingActionParam {
  vmInstanceUuid: string;
  instanceOfferingUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeInstanceOfferingResult {
  inventory?: VmInstanceInventory;
}
