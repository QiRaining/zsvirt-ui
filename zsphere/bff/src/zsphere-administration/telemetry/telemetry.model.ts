import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

import { ActionInput } from "@/common/model/action.model";

export const TELEMETRY_CONSENT_UUID = "telemetry-consent";

export enum TelemetryConsentAction {
  Enabled = "Enabled",
  Disabled = "Disabled",
}

registerEnumType(TelemetryConsentAction, {
  name: "TelemetryConsentAction",
});

@ObjectType()
export class TelemetryConsentInventory {
  @Field(() => String)
  uuid: string;

  @Field(() => String)
  consentGrantedAt: string;
}

@ObjectType()
export class TelemetrySettingInventory {
  @Field(() => String)
  descriptionKey: string;

  @Field(() => String)
  privacyPolicyUrl: string;
}

@ObjectType()
export class TelemetryUpdateInventory {
  @Field(() => String, { nullable: true })
  version?: string;

  @Field(() => String, { nullable: true })
  currentVersion?: string;

  @Field(() => String, { nullable: true })
  releaseNotesZh?: string;

  @Field(() => String, { nullable: true })
  releaseNotesEn?: string;
}

@InputType()
export class UpdateTelemetryConsentPayload {
  @Field(() => TelemetryConsentAction)
  action: TelemetryConsentAction;

  @Field(() => Boolean, { nullable: true })
  agreedToTerms?: boolean;
}

@InputType()
export class UpdateTelemetryConsentInput {
  @Field(() => UpdateTelemetryConsentPayload)
  payload: UpdateTelemetryConsentPayload;

  @Field(() => ActionInput)
  action: ActionInput;
}
