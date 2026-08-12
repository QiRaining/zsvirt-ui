import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ShareResourceToGroupAction extends ActionAdvance {
  async call(
    params: ShareResourceToGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ShareResourceToGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ShareResourceToGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/account-groups/resources/actions`,
      {
        shareResourceToGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ShareResourceToGroupResult>(
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

export interface ShareResourceToGroupActionParam {
  resourceUuids: any[];
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ShareResourceToGroupResult {}
