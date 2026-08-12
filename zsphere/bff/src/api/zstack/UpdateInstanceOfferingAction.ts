import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { InstanceOfferingInventory } from "./types";

@Injectable()
export class UpdateInstanceOfferingAction extends ActionAdvance {
  async call(
    params: UpdateInstanceOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateInstanceOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateInstanceOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/instance-offerings/${params.uuid}/actions`,
      {
        updateInstanceOffering: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateInstanceOfferingResult>(
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

export interface UpdateInstanceOfferingActionParam {
  uuid: string;
  name?: string;
  description?: string;
  allocatorStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateInstanceOfferingResult {
  inventory?: InstanceOfferingInventory;
}
