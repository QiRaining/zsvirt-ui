import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPciDeviceCandidatesForAttachingVmAction extends QueryAdvance {
  async call(
    params: GetPciDeviceCandidatesForAttachingVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPciDeviceCandidatesForAttachingVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPciDeviceCandidatesForAttachingVmAction.name,
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
      `/vm-instances/${params.vmInstanceUuid}/candidate-pci-devices${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPciDeviceCandidatesForAttachingVmResult>(
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

export interface GetPciDeviceCandidatesForAttachingVmActionParam {
  vmInstanceUuid: string;
  types?: any[];
  pciSpecUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPciDeviceCandidatesForAttachingVmResult {
  inventories?: any[];
}
