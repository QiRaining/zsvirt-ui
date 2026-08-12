import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetScsiLunCandidatesForAttachingVmAction extends QueryAdvance {
  async call(
    params: GetScsiLunCandidatesForAttachingVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetScsiLunCandidatesForAttachingVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetScsiLunCandidatesForAttachingVmAction.name,
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
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/${params.vmInstanceUuid}/candidate-storage-devices${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetScsiLunCandidatesForAttachingVmResult>(
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

export interface GetScsiLunCandidatesForAttachingVmActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetScsiLunCandidatesForAttachingVmResult {
  inventories?: any[];
}
