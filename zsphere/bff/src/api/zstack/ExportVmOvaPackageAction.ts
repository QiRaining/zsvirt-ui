import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImagePackageInventory } from "./types";

@Injectable()
export class ExportVmOvaPackageAction extends ActionAdvance {
  async call(
    params: ExportVmOvaPackageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExportVmOvaPackageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExportVmOvaPackageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ovf/ova-packages`,
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
    return this.postAction<ExportVmOvaPackageResult>(
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

export interface ExportVmOvaPackageActionParam {
  name?: string;
  description?: string;
  vmUuid: string;
  backupStorageUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExportVmOvaPackageResult {
  inventory?: ImagePackageInventory;
}
