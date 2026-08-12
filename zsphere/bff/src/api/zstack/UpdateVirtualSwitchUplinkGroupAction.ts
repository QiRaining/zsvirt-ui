import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { UplinkGroupInventory } from "./types";

@Injectable()
export class UpdateVirtualSwitchUplinkGroupAction extends ActionAdvance {
  async call(
    params: UpdateVirtualSwitchUplinkGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVirtualSwitchUplinkGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVirtualSwitchUplinkGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l2-networks/virtual-switch/${params.uuid}/uplink-group`,
      {
        updateVirtualSwitchUplinkGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVirtualSwitchUplinkGroupResult>(
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

export interface UpdateVirtualSwitchUplinkGroupActionParam {
  uuid: string;
  hostUuid: string;
  slaveUuids?: any[];
  slaveNames?: any[];
  type?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVirtualSwitchUplinkGroupResult {
  inventory?: UplinkGroupInventory;
}
