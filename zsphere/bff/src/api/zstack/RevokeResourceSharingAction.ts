import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevokeResourceSharingAction extends ActionAdvance {
  async call(
    params: RevokeResourceSharingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevokeResourceSharingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevokeResourceSharingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/accounts/resources/actions`,
      {
        revokeResourceSharing: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevokeResourceSharingResult>(
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

export interface RevokeResourceSharingActionParam {
  resourceUuids: any[];
  toPublic?: boolean;
  accountUuids?: any[];
  all?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevokeResourceSharingResult {}
