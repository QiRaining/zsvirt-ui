import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class MountBlockDeviceAction extends ActionAdvance {
  async call(
    params: MountBlockDeviceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<MountBlockDeviceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      MountBlockDeviceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/host/mount-block-device`,
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
    return this.postAction<MountBlockDeviceResult>(
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

export interface MountBlockDeviceActionParam {
  username: string;
  password?: string;
  sshPort: number;
  hostName: string;
  path: string;
  mountPoint: string;
  filesystemType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface MountBlockDeviceResult {}
