import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachTagFromResourcesAction extends ActionAdvance {
  async call(
    params: DetachTagFromResourcesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachTagFromResourcesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachTagFromResourcesAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "tagUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/tags/${params.tagUuid}/resources${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachTagFromResourcesResult>(
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

export interface DetachTagFromResourcesActionParam {
  tagUuid: string;
  resourceUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachTagFromResourcesResult {}
