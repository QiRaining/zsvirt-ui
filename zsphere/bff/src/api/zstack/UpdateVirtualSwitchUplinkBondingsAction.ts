import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateVirtualSwitchUplinkBondingsAction extends ActionAdvance {
  async call(
    params: UpdateVirtualSwitchUplinkBondingsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVirtualSwitchUplinkBondingsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVirtualSwitchUplinkBondingsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l2-networks/virtual-switch/${params.uuid}/uplink-bondings`,
      {
        updateVirtualSwitchUplinkBondings: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVirtualSwitchUplinkBondingsResult>(
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

export interface UpdateVirtualSwitchUplinkBondingsActionParam {
  uuid: string;
  bondingName?: string;
  mode: string;
  xmitHashPolicy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVirtualSwitchUplinkBondingsResult {
  inventories?: any[];
}
