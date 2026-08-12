import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCpuMemoryCapacityAction extends QueryAdvance {
  async call(
    params: GetCpuMemoryCapacityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCpuMemoryCapacityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCpuMemoryCapacityAction.name,
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
      `/hosts/capacities/cpu-memory${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCpuMemoryCapacityResult>(
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

export interface GetCpuMemoryCapacityActionParam {
  zoneUuids?: any[];
  clusterUuids?: any[];
  hostUuids?: any[];
  hypervisorType?: string;
  all?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCpuMemoryCapacityResult {
  totalCpu?: number;
  availableCpu?: number;
  totalMemory?: number;
  availableMemory?: number;
  managedCpuNum?: number;
  capacityData?: any[];
  resourceType?: string;
}
