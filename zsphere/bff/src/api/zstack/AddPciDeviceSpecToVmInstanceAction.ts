import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstancePciDeviceSpecRefInventory } from "./types";

@Injectable()
export class AddPciDeviceSpecToVmInstanceAction extends ActionAdvance {
  async call(
    params: AddPciDeviceSpecToVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddPciDeviceSpecToVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddPciDeviceSpecToVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/pci-device-specs/${params.pciSpecUuid}/vm-instances/${params.vmInstanceUuid}`,
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
    return this.postAction<AddPciDeviceSpecToVmInstanceResult>(
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

export interface AddPciDeviceSpecToVmInstanceActionParam {
  pciSpecUuid: string;
  vmInstanceUuid: string;
  pciDeviceNumber?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddPciDeviceSpecToVmInstanceResult {
  inventory?: VmInstancePciDeviceSpecRefInventory;
}
