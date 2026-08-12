import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetL3NetworkRouterInterfaceIpAction extends ActionAdvance {
  async call(
    params: SetL3NetworkRouterInterfaceIpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetL3NetworkRouterInterfaceIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetL3NetworkRouterInterfaceIpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/router-interface-ip`,
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
    return this.postAction<SetL3NetworkRouterInterfaceIpResult>(
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

export interface SetL3NetworkRouterInterfaceIpActionParam {
  l3NetworkUuid: string;
  routerInterfaceIp: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetL3NetworkRouterInterfaceIpResult {}
