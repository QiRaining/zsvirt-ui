import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidatePrimaryStoragesForCreatingVmAction extends QueryAdvance {
  async call(
    params: GetCandidatePrimaryStoragesForCreatingVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidatePrimaryStoragesForCreatingVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidatePrimaryStoragesForCreatingVmAction.name,
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
      `/vm-instances/candidate-storages${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidatePrimaryStoragesForCreatingVmResult>(
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

export interface GetCandidatePrimaryStoragesForCreatingVmActionParam {
  imageUuid: string;
  l3NetworkUuids: any[];
  rootDiskOfferingUuid?: string;
  rootDiskSize?: number;
  dataDiskOfferingUuids?: any[];
  dataDiskSizes?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  defaultL3NetworkUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidatePrimaryStoragesForCreatingVmResult {
  rootVolumePrimaryStorages?: any[];
  dataVolumePrimaryStorages?: any;
}
