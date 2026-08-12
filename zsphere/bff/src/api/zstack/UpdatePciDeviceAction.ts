import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PciDeviceInventory } from "./types";

@Injectable()
export class UpdatePciDeviceAction extends ActionAdvance {
  async call(
    params: UpdatePciDeviceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdatePciDeviceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdatePciDeviceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-device/pci-devices/${params.uuid}/actions`,
      {
        updatePciDevice: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdatePciDeviceResult>(
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

export interface UpdatePciDeviceActionParam {
  uuid: string;
  state?: string;
  passThroughState?: string;
  name?: string;
  description?: string;
  metaData?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdatePciDeviceResult {
  inventory?: PciDeviceInventory;
}
