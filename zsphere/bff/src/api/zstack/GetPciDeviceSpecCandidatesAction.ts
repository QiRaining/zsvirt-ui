import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPciDeviceSpecCandidatesAction extends QueryAdvance {
  async call(
    params: GetPciDeviceSpecCandidatesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPciDeviceSpecCandidatesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPciDeviceSpecCandidatesAction.name,
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
      `/pci-device-specs/candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPciDeviceSpecCandidatesResult>(
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

export interface GetPciDeviceSpecCandidatesActionParam {
  clusterUuids?: any[];
  hostUuid?: string;
  vmInstanceUuid?: string;
  vmInstanceUuids?: any[];
  types?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPciDeviceSpecCandidatesResult {
  inventories?: any[];
}
