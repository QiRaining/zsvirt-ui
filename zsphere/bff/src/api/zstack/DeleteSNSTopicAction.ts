import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteSNSTopicAction extends ActionAdvance {
  async call(
    params: DeleteSNSTopicActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteSNSTopicResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteSNSTopicAction.name,
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
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/sns/topics/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteSNSTopicResult>(
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

export interface DeleteSNSTopicActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteSNSTopicResult {}
