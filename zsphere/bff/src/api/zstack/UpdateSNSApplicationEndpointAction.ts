import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationEndpointInventory } from "./types";

@Injectable()
export class UpdateSNSApplicationEndpointAction extends ActionAdvance {
  async call(
    params: UpdateSNSApplicationEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSApplicationEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSApplicationEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/${params.uuid}/actions`,
      {
        updateSNSApplicationEndpoint: params,
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

export interface UpdateSNSApplicationEndpointActionParam {
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
