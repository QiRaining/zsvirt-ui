import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ShareResourceAction extends ActionAdvance {
  async call(
    params: ShareResourceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ShareResourceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ShareResourceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/accounts/resources/actions`,
      {
        shareResource: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ShareResourceResult>(
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

export interface ShareResourceActionParam {
  resourceUuids: any[];
  accountUuids?: any[];
  toPublic?: boolean;
  permission?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ShareResourceResult {}
