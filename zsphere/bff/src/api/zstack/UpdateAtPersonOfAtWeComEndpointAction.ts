import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSWeComAtPersonInventory } from "./types";

@Injectable()
export class UpdateAtPersonOfAtWeComEndpointAction extends ActionAdvance {
  async call(
    params: UpdateAtPersonOfAtWeComEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAtPersonOfWeComEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAtPersonOfAtWeComEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/we-com/at-persons/${params.uuid}/actions`,
      {
        updateAtPersonOfAtWeComEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAtPersonOfWeComEndpointResult>(
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

export interface UpdateAtPersonOfAtWeComEndpointActionParam {
  uuid: string;
  endpointUuid: string;
  userId?: string;
  remark?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAtPersonOfWeComEndpointResult {
  inventory?: SNSWeComAtPersonInventory;
}
