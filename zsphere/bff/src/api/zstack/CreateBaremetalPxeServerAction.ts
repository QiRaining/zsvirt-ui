import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class CreateBaremetalPxeServerAction extends ActionAdvance {
  async call(
    params: CreateBaremetalPxeServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBaremetalPxeServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBaremetalPxeServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/pxeservers`,
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
    return this.postAction<CreateBaremetalPxeServerResult>(
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

export interface CreateBaremetalPxeServerActionParam {
  zoneUuid: string;
  name: string;
  description?: string;
  hostname: string;
  sshUsername: string;
  sshPassword: string;
  sshPort?: number;
  storagePath: string;
  dhcpInterface: string;
  dhcpRangeBegin?: string;
  dhcpRangeEnd?: string;
  dhcpRangeNetmask?: string;
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

export interface CreateBaremetalPxeServerResult {
  inventory?: BaremetalPxeServerInventory;
}
