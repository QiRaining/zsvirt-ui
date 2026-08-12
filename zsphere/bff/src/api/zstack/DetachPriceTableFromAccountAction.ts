import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PriceTableInventory } from "./types";

@Injectable()
export class DetachPriceTableFromAccountAction extends ActionAdvance {
  async call(
    params: DetachPriceTableFromAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachPriceTableFromAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachPriceTableFromAccountAction.name,
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
      "tableUuid",
      "accountUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/billings/price-tables/${params.tableUuid}/accounts/${params.accountUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachPriceTableFromAccountResult>(
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

export interface DetachPriceTableFromAccountActionParam {
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

export interface DetachPriceTableFromAccountResult {
  inventory?: PriceTableInventory;
}
