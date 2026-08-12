import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSFeiShuAtPersonInventory } from "./types";

@Injectable()
export class UpdateAtPersonOfAtFeiShuEndpointAction extends ActionAdvance {
  async call(
    params: UpdateAtPersonOfAtFeiShuEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAtPersonOfFeiShuEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAtPersonOfAtFeiShuEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/feishu/at-persons/${params.uuid}/actions`,
      {
        updateAtPersonOfAtFeiShuEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAtPersonOfFeiShuEndpointResult>(
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

export interface UpdateAtPersonOfAtFeiShuEndpointActionParam {
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

export interface UpdateAtPersonOfFeiShuEndpointResult {
  inventory?: SNSFeiShuAtPersonInventory;
}
