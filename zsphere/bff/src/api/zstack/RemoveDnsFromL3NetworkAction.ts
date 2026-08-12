import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class RemoveDnsFromL3NetworkAction extends ActionAdvance {
  async call(
    params: RemoveDnsFromL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveDnsFromL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveDnsFromL3NetworkAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "l3NetworkUuid",
      "dns",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/l3-networks/${params.l3NetworkUuid}/dns/${params.dns}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveDnsFromL3NetworkResult>(
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

export interface RemoveDnsFromL3NetworkActionParam {
  l3NetworkUuid: string;
  dns: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveDnsFromL3NetworkResult {
  inventory?: L3NetworkInventory;
}
