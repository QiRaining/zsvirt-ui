import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AttachTagToResourcesAction extends ActionAdvance {
  async call(
    params: AttachTagToResourcesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachTagToResourcesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachTagToResourcesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/tags/${params.tagUuid}/resources`,
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
    return this.postAction<AttachTagToResourcesResult>(
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

export interface AttachTagToResourcesActionParam {
  tagUuid: string;
  resourceUuids: any[];
  tokens?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachTagToResourcesResult {
  results?: any[];
}
