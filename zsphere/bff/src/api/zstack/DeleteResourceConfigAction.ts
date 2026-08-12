import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteResourceConfigAction extends ActionAdvance {
  async call(
    params: DeleteResourceConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteResourceConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteResourceConfigAction.name,
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
      "category",
      "name",
      "resourceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/resource-configurations/${params.category}/${params.name}/${params.resourceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteResourceConfigResult>(
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

export interface DeleteResourceConfigActionParam {
  category: string;
  name: string;
  resourceUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteResourceConfigResult {}
