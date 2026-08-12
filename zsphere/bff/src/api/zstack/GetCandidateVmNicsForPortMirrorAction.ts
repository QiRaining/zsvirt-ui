import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateVmNicsForPortMirrorAction extends QueryAdvance {
  async call(
    params: GetCandidateVmNicsForPortMirrorActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateVmNicsForPortMirrorResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateVmNicsForPortMirrorAction.name,
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
      "portMirrorUuid",
      "type",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/port-mirrors/${params.portMirrorUuid}/vm-instances/candidate-nics/${params.type}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateVmNicsForPortMirrorResult>(
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

export interface GetCandidateVmNicsForPortMirrorActionParam {
  portMirrorUuid: string;
  type: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidateVmNicsForPortMirrorResult {
  inventories?: any[];
}
