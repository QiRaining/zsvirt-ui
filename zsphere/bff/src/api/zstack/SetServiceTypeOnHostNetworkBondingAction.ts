import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetServiceTypeOnHostNetworkBondingAction extends ActionAdvance {
  async call(
    params: SetServiceTypeOnHostNetworkBondingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetServiceTypeOnHostNetworkBondingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetServiceTypeOnHostNetworkBondingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/bondings/service-types`,
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
    return this.postAction<SetServiceTypeOnHostNetworkBondingResult>(
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

export interface SetServiceTypeOnHostNetworkBondingActionParam {
  bondingUuids: any[];
  vlanIds?: any[];
  serviceTypes?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetServiceTypeOnHostNetworkBondingResult {
  inventory?: any[];
}
