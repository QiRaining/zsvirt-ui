import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmCdRomInventory } from "./types";

@Injectable()
export class SetVmInstanceDefaultCdRomAction extends ActionAdvance {
  async call(
    params: SetVmInstanceDefaultCdRomActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetVmInstanceDefaultCdRomResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetVmInstanceDefaultCdRomAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/cdroms/${params.uuid}/actions`,
      {
        setVmInstanceDefaultCdRom: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetVmInstanceDefaultCdRomResult>(
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

export interface SetVmInstanceDefaultCdRomActionParam {
  uuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetVmInstanceDefaultCdRomResult {
  inventory?: VmCdRomInventory;
}
