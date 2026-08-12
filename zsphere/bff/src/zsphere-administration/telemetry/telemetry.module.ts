import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

import { ZStackApiModule } from "@/api/zstack/zstack-api.module";
import { ZsEvent } from "@/model/zs-event.model";
import { ZsSession } from "@/model/zs-session.model";

import { TelemetryActionService } from "./telemetry.action";
import { TelemetryResolver } from "./telemetry.resolver";
import {
  TelemetryAccessService,
  TelemetryService,
} from "./telemetry.service";

@Module({
  imports: [
    ZStackApiModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
  ],
  providers: [
    TelemetryAccessService,
    TelemetryService,
    TelemetryActionService,
    TelemetryResolver,
  ],
})
export class TelemetryModule {}
