import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationEndpointInventory } from "./types";

@Injectable()
export class UpdateSNSFeiShuEndpointAction extends ActionAdvance {
  async call(
    params: UpdateSNSFeiShuEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSApplicationEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSFeiShuEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/feishu/${params.uuid}/actions`,
      {
        updateSNSFeiShuEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSNSApplicationEndpointResult>(
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

export interface UpdateSNSFeiShuEndpointActionParam {
  url?: string;
  atAll?: boolean;
  secret?: string;
  uuid: string;
  name?: string;
  description?: string;
  platformUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSNSApplicationEndpointResult {
  inventory?: SNSApplicationEndpointInventory;
}
