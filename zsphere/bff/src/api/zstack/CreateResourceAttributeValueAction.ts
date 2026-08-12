import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CreateResourceAttributeValueAction extends ActionAdvance {
  async call(
    params: CreateResourceAttributeValueActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateResourceAttributeValueResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateResourceAttributeValueAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/resource-attributes/${params.keyUuid}/resources`,
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
    return this.postAction<CreateResourceAttributeValueResult>(
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

export interface CreateResourceAttributeValueActionParam {
  keyUuid: string;
  value: string;
  resourceUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateResourceAttributeValueResult {
  inventories?: any[];
}
