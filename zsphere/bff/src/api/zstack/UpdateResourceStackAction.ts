import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ResourceStackInventory } from "./types";

@Injectable()
export class UpdateResourceStackAction extends ActionAdvance {
  async call(
    params: UpdateResourceStackActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateResourceStackResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateResourceStackAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/cloudformation/stack/${params.uuid}/actions`,
      {
        updateResourceStack: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateResourceStackResult>(
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

export interface UpdateResourceStackActionParam {
  uuid: string;
  name?: string;
  description?: string;
  rollback?: boolean;
  templateContent?: string;
  parameters?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateResourceStackResult {
  inventory?: ResourceStackInventory;
}
