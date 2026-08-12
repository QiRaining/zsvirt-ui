import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class AddDnsToL3NetworkAction extends ActionAdvance {
  async call(
    params: AddDnsToL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddDnsToL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddDnsToL3NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/dns`,
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
    return this.postAction<AddDnsToL3NetworkResult>(
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

export interface AddDnsToL3NetworkActionParam {
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

export interface AddDnsToL3NetworkResult {
  inventory?: L3NetworkInventory;
}
