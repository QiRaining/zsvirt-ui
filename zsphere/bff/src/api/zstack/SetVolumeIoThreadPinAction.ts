import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetVolumeIoThreadPinAction extends ActionAdvance {
  async call(
    params: SetVolumeIoThreadPinActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVolumeIoThreadPinResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVolumeIoThreadPinAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/${params.uuid}/actions`,
      {
        setVolumeIoThreadPin: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVolumeIoThreadPinResult>(
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

export interface SetVolumeIoThreadPinActionParam {
  uuid: string;
  vmUuid: string;
  pin: string;
  ioThreadId: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVolumeIoThreadPinResult {
  volumeUuid?: string;
  ioThreadId?: number;
  pin?: string;
}
