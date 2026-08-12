import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVmGuestToolsInfoAction extends QueryAdvance {
  async call(
    params: GetVmGuestToolsInfoActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVmGuestToolsInfoResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVmGuestToolsInfoAction.name,
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
      `/vm-instances/${params.uuid}/guest-tools-infos${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVmGuestToolsInfoResult>(
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

export interface GetVmGuestToolsInfoActionParam {
  uuid: string;
  debug?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVmGuestToolsInfoResult {
  version?: string;
  status?: string;
  features?: any;
}
