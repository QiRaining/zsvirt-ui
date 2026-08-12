import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";
import { GuestToolsInventory } from "./types";

@Injectable()
export class GetLatestGuestToolsForVmAction extends QueryAdvance {
  async call(
    params: GetLatestGuestToolsForVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetLatestGuestToolsForVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetLatestGuestToolsForVmAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/${params.uuid}/latest-guest-tools${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetLatestGuestToolsForVmResult>(
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

export interface GetLatestGuestToolsForVmActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetLatestGuestToolsForVmResult {
  inventory?: GuestToolsInventory;
}
