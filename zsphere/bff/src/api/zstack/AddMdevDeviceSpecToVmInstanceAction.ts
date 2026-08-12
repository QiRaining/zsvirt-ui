import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceMdevDeviceSpecRefInventory } from "./types";

@Injectable()
export class AddMdevDeviceSpecToVmInstanceAction extends ActionAdvance {
  async call(
    params: AddMdevDeviceSpecToVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddMdevDeviceSpecToVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddMdevDeviceSpecToVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/mdev-device-specs/${params.mdevSpecUuid}/vm-instances/${params.vmInstanceUuid}`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddMdevDeviceSpecToVmInstanceResult>(
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

export interface AddMdevDeviceSpecToVmInstanceActionParam {
  mdevSpecUuid: string;
  vmInstanceUuid: string;
  mdevDeviceNumber?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddMdevDeviceSpecToVmInstanceResult {
  inventory?: VmInstanceMdevDeviceSpecRefInventory;
}
