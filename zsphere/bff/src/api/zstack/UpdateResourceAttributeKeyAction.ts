import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ResourceAttributeKeyInventory } from "./types";

@Injectable()
export class UpdateResourceAttributeKeyAction extends ActionAdvance {
  async call(
    params: UpdateResourceAttributeKeyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateResourceAttributeKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateResourceAttributeKeyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/resource-attributes/${params.uuid}/actions`,
      {
        updateResourceAttributeKey: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateResourceAttributeKeyResult>(
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

export interface UpdateResourceAttributeKeyActionParam {
  uuid: string;
  name?: string;
  description?: string;
  resourceTypes?: any[];
  createConstraints?: any[];
  updateConstraints?: any[];
  deleteConstraintIds?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateResourceAttributeKeyResult {
  inventory?: ResourceAttributeKeyInventory;
}
