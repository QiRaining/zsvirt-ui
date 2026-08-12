import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetServiceTypeOnHostNetworkInterfaceAction extends ActionAdvance {
  async call(
    params: SetServiceTypeOnHostNetworkInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetServiceTypeOnHostNetworkInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetServiceTypeOnHostNetworkInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/nics/service-types`,
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
    return this.postAction<SetServiceTypeOnHostNetworkInterfaceResult>(
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

export interface SetServiceTypeOnHostNetworkInterfaceActionParam {
  interfaceUuids: any[];
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

export interface SetServiceTypeOnHostNetworkInterfaceResult {
  inventory?: any[];
}
