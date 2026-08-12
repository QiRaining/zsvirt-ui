import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteResourceAttributeValueAction extends ActionAdvance {
  async call(
    params: DeleteResourceAttributeValueActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteResourceAttributeValueResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteResourceAttributeValueAction.name,
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
      "keyUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/resource-attributes/${params.keyUuid}/resources${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteResourceAttributeValueResult>(
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

export interface DeleteResourceAttributeValueActionParam {
  keyUuid: string;
  resourceUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteResourceAttributeValueResult {}
