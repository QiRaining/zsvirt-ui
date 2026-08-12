import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmCdRomInventory } from "./types";

@Injectable()
export class UpdateVmCdRomAction extends ActionAdvance {
  async call(
    params: UpdateVmCdRomActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmCdRomResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmCdRomAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/cdroms/${params.uuid}/actions`,
      {
        updateVmCdRom: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmCdRomResult>(
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

export interface UpdateVmCdRomActionParam {
  uuid: string;
  description?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmCdRomResult {
  inventory?: VmCdRomInventory;
}
