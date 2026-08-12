import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSFeiShuAtPersonInventory } from "./types";

@Injectable()
export class AddSNSFeiShuAtPersonAction extends ActionAdvance {
  async call(
    params: AddSNSFeiShuAtPersonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSNSFeiShuAtPersonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSNSFeiShuAtPersonAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/feishu/at-persons`,
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
    return this.postAction<AddSNSFeiShuAtPersonResult>(
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

export interface AddSNSFeiShuAtPersonActionParam {
  userId: string;
  endpointUuid: string;
  remark?: string;
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

export interface AddSNSFeiShuAtPersonResult {
  inventory?: SNSFeiShuAtPersonInventory;
}
