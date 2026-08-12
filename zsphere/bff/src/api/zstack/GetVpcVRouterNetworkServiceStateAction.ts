import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVpcVRouterNetworkServiceStateAction extends QueryAdvance {
  async call(
    params: GetVpcVRouterNetworkServiceStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVpcVRouterNetworkServiceStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVpcVRouterNetworkServiceStateAction.name,
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
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vpc/virtual-routers/${params.uuid}/networkservicestate${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVpcVRouterNetworkServiceStateResult>(
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

export interface GetVpcVRouterNetworkServiceStateActionParam {
  uuid: string;
  networkService: string;
  l3NetworkUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVpcVRouterNetworkServiceStateResult {
  state?: string;
}
