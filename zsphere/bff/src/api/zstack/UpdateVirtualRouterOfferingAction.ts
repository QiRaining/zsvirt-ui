import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { InstanceOfferingInventory } from "./types";

@Injectable()
export class UpdateVirtualRouterOfferingAction extends ActionAdvance {
  async call(
    params: UpdateVirtualRouterOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateInstanceOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVirtualRouterOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/instance-offerings/virtual-routers/${params.uuid}/actions`,
      {
        updateVirtualRouterOffering: params,
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

export interface UpdateVirtualRouterOfferingActionParam {
  isDefault?: boolean;
  imageUuid?: string;
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
