import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { RaidPhysicalDriveInventory } from "./types";

@Injectable()
export class LocateLocalRaidPhysicalDriveAction extends ActionAdvance {
  async call(
    params: LocateLocalRaidPhysicalDriveActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LocateLocalRaidPhysicalDriveResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      LocateLocalRaidPhysicalDriveAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/local-raid/physical-drives/${params.uuid}/actions`,
      {
        locateLocalRaidPhysicalDrive: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<LocateLocalRaidPhysicalDriveResult>(
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

export interface LocateLocalRaidPhysicalDriveActionParam {
  uuid: string;
  locate?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface LocateLocalRaidPhysicalDriveResult {
  inventory?: RaidPhysicalDriveInventory;
}
