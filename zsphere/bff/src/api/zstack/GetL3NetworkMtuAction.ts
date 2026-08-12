import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetL3NetworkMtuAction extends QueryAdvance {
  async call(
    params: GetL3NetworkMtuActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetL3NetworkMtuResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetL3NetworkMtuAction.name,
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
      `/l3-networks/${params.l3NetworkUuid}/mtu${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetL3NetworkMtuResult>(
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

export interface GetL3NetworkMtuActionParam {
  l3NetworkUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetL3NetworkMtuResult {
  mtu?: number;
}
