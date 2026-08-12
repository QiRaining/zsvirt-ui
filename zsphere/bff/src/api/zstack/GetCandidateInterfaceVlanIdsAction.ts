import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateInterfaceVlanIdsAction extends QueryAdvance {
  async call(
    params: GetCandidateInterfaceVlanIdsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateInterfaceVlanIdsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateInterfaceVlanIdsAction.name,
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
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/host/network-interface-vlan-ids${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateInterfaceVlanIdsResult>(
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

export interface GetCandidateInterfaceVlanIdsActionParam {
  interfaceUuids: any[];
  limit?: number;
  start?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidateInterfaceVlanIdsResult {
  vlanIds?: any[];
}
