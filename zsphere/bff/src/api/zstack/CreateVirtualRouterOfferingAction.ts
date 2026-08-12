import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { InstanceOfferingInventory } from "./types";

@Injectable()
export class CreateVirtualRouterOfferingAction extends ActionAdvance {
  async call(
    params: CreateVirtualRouterOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateInstanceOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVirtualRouterOfferingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/instance-offerings/virtual-routers`,
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
    return this.postAction<CreateInstanceOfferingResult>(
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

export interface CreateVirtualRouterOfferingActionParam {
  zoneUuid: string;
  managementNetworkUuid: string;
  imageUuid: string;
  publicNetworkUuid?: string;
  isDefault?: boolean;
  name: string;
  description?: string;
  cpuNum: number;
  memorySize: number;
  reservedMemorySize?: number;
  allocatorStrategy?: string;
  sortKey?: number;
  type?: string;
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

export interface CreateInstanceOfferingResult {
  inventory?: InstanceOfferingInventory;
}
