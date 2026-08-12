import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ScsiLunInventory } from "./types";

@Injectable()
export class AttachScsiLunToVmInstanceAction extends ActionAdvance {
  async call(
    params: AttachScsiLunToVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachScsiLunToVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachScsiLunToVmInstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vm-instances/${params.vmInstanceUuid}/scsi-lun/${params.uuid}`,
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
    return this.postAction<AttachScsiLunToVmInstanceResult>(
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

export interface AttachScsiLunToVmInstanceActionParam {
  uuid: string;
  vmInstanceUuid: string;
  disableMultiPathAttach?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachScsiLunToVmInstanceResult {
  inventory?: ScsiLunInventory;
}
