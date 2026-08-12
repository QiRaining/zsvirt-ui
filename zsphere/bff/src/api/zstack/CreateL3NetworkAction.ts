import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class CreateL3NetworkAction extends ActionAdvance {
  async call(
    params: CreateL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateL3NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks`,
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
    return this.postAction<CreateL3NetworkResult>(
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

export interface CreateL3NetworkActionParam {
  name: string;
  description?: string;
  type?: string;
  l2NetworkUuid: string;
  category?: string;
  ipVersion?: number;
  system?: boolean;
  dnsDomain?: string;
  enableIPAM?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateL3NetworkResult {
  inventory?: L3NetworkInventory;
}
