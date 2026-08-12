import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSFeiShuEndpointInventory } from "./types";

@Injectable()
export class CreateSNSFeiShuEndpointAction extends ActionAdvance {
  async call(
    params: CreateSNSFeiShuEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSFeiShuEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSFeiShuEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/feishu`,
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
    return this.postAction<CreateSNSFeiShuEndpointResult>(
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

export interface CreateSNSFeiShuEndpointActionParam {
  url: string;
  atAll?: boolean;
  atPersonUserIds?: any[];
  secret?: string;
  atPersonList?: any;
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

export interface CreateSNSFeiShuEndpointResult {
  inventory?: SNSFeiShuEndpointInventory;
}
