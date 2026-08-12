import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPciDeviceCandidatesForNewCreateVmAction extends QueryAdvance {
  async call(
    params: GetPciDeviceCandidatesForNewCreateVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPciDeviceCandidatesForNewCreateVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPciDeviceCandidatesForNewCreateVmAction.name,
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
      `/pci-device/candidate-pci-devices-for-new-create-vm${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPciDeviceCandidatesForNewCreateVmResult>(
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

export interface GetPciDeviceCandidatesForNewCreateVmActionParam {
  hostUuid?: string;
  clusterUuids?: any[];
  types?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPciDeviceCandidatesForNewCreateVmResult {
  inventories?: any[];
}
