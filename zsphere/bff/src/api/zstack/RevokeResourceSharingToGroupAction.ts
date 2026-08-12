import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevokeResourceSharingToGroupAction extends ActionAdvance {
  async call(
    params: RevokeResourceSharingToGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevokeResourceSharingToGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevokeResourceSharingToGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/account-groups/resources/actions`,
      {
        revokeResourceSharingToGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevokeResourceSharingToGroupResult>(
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

export interface RevokeResourceSharingToGroupActionParam {
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

export interface RevokeResourceSharingToGroupResult {}
