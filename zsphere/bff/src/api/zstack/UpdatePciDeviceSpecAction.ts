import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PciDeviceSpecInventory } from "./types";

@Injectable()
export class UpdatePciDeviceSpecAction extends ActionAdvance {
  async call(
    params: UpdatePciDeviceSpecActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdatePciDeviceSpecResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdatePciDeviceSpecAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-device-specs/${params.uuid}/actions`,
      {
        updatePciDeviceSpec: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdatePciDeviceSpecResult>(
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

export interface UpdatePciDeviceSpecActionParam {
  uuid: string;
  name?: string;
  description?: string;
  romContent?: string;
  romVersion?: string;
  abandonSpecRom?: boolean;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdatePciDeviceSpecResult {
  inventory?: PciDeviceSpecInventory;
}
