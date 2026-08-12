import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSSmsEndpointInventory } from "./types";

@Injectable()
export class CreateSNSAliyunSmsEndpointAction extends ActionAdvance {
  async call(
    params: CreateSNSAliyunSmsEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSAliyunSmsEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSAliyunSmsEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/sms-endpoints/aliyunsms`,
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
    return this.postAction<CreateSNSAliyunSmsEndpointResult>(
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

export interface CreateSNSAliyunSmsEndpointActionParam {
  accessKeyUuid: string;
  receivers?: any[];
  name: string;
  description?: string;
  platformUuid?: string;
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

export interface CreateSNSAliyunSmsEndpointResult {
  inventory?: SNSSmsEndpointInventory;
}
