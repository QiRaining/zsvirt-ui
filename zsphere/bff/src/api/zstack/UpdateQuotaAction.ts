import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { QuotaInventory } from "./types";

@Injectable()
export class UpdateQuotaAction extends ActionAdvance {
  async call(
    params: UpdateQuotaActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateQuotaResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateQuotaAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/accounts/quotas/actions`,
      {
        updateQuota: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateQuotaResult>(
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

export interface UpdateQuotaActionParam {
  identityUuid: string;
  name: string;
  value: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateQuotaResult {
  inventory?: QuotaInventory;
}
