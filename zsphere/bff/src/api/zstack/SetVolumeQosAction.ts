import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class SetVolumeQosAction extends ActionAdvance {
  async call(
    params: SetVolumeQosActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVolumeQosResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVolumeQosAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/${params.uuid}/actions`,
      {
        setVolumeQos: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVolumeQosResult>(
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

export interface SetVolumeQosActionParam {
  uuid: string;
  mode?: string;
  volumeBandwidth?: number;
  readBandwidth?: number;
  writeBandwidth?: number;
  totalBandwidth?: number;
  readIOPS?: number;
  writeIOPS?: number;
  totalIOPS?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVolumeQosResult {
  inventory?: VolumeInventory;
}
