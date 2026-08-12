import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetL3NetworkRouterInterfaceIpAction extends QueryAdvance {
  async call(
    params: GetL3NetworkRouterInterfaceIpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetL3NetworkRouterInterfaceIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetL3NetworkRouterInterfaceIpAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "l3NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/l3-networks/${params.l3NetworkUuid}/router-interface-ip${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetL3NetworkRouterInterfaceIpResult>(
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

export interface GetL3NetworkRouterInterfaceIpActionParam {
  l3NetworkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetL3NetworkRouterInterfaceIpResult {
  routerInterfaceIp?: string;
}
