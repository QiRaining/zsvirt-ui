import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PriceTableInventory } from "./types";

@Injectable()
export class AttachPriceTableToAccountAction extends ActionAdvance {
  async call(
    params: AttachPriceTableToAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachPriceTableToAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachPriceTableToAccountAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/billings/price-tables/${params.tableUuid}/accounts/${params.accountUuid}`,
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
    return this.postAction<AttachPriceTableToAccountResult>(
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

export interface AttachPriceTableToAccountActionParam {
  accountUuid: string;
  tableUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachPriceTableToAccountResult {
  inventory?: PriceTableInventory;
}
