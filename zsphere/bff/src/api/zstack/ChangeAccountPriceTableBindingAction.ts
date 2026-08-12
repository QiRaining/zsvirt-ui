import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PriceTableInventory } from "./types";

@Injectable()
export class ChangeAccountPriceTableBindingAction extends ActionAdvance {
  async call(
    params: ChangeAccountPriceTableBindingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeAccountPriceTableBindingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeAccountPriceTableBindingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/billings/price-tables/${params.tableUuid}/accounts/${params.accountUuid}`,
      {
        changeAccountPriceTableBinding: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeAccountPriceTableBindingResult>(
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

export interface ChangeAccountPriceTableBindingActionParam {
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

export interface ChangeAccountPriceTableBindingResult {
  inventory?: PriceTableInventory;
}
