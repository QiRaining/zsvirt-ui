import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { AddAlarmToEndpointService } from './add-alarm'
import { AddSNSDingTalkAtPersonService } from './add-dingtalk-at-person'
import { AddEmailAddressToEndpointService } from './add-email-address-to-endpoint'
import { AddSmsReceiverService } from './add-sms-receiver'
import { ChangeEndpointStateService } from './change-state'
import { CreateDingTalkEndpointService } from './create-dingtalk-endpoint'
import { CreateEmailEndpointService } from './create-email-endpoint'
import { CreateFeiShuEndpointService } from './create-feishu-endpoint'
import { CreateHttpEndpointService } from './create-http-endpoint'
import { CreateSNSMicrosoftTeamsEndpointService } from './create-microsoft-teams-endpoint'
import { CreateAliyunSmsEndpointService } from './create-sms-endpoint'
import { CreateSnmpTrapEndpointService } from './create-snmp-trap-endpoint'
import { CreateWeComEndpointService } from './create-wecom-endpoint'
import { DeleteEndpointService } from './delete'
import { DeleteEmailAddressToEndpointService } from './delete-email-address-of-endpoint'
import { ModifyDingTalkAtPersonService } from './modify-dingtalk-at-person'
import { RemoveAlarmFromEndpointService } from './remove-alarm'
import { RemoveSNSDingTalkAtPersonService } from './remove-dingtalk-at-person'
import { RemoveSmsReceiverService } from './remove-sms-receiver'
import { SNSEmailTestConnectionService } from './sns-email-testConnection'
import { SNSSnmpTestConnectionService } from './sns-snmp-testConnection'
import { TestConnectSNSEndPointService } from './test-connect-endpoint'
import { CreateSNSTopicService } from './topic/create-sns-topic'
import { DeleteSNSTopicService } from './topic/delete-sns-topic'
import { SubscribeSNSTopicService } from './topic/subscribe-sns-topic'
import { UnsubscribeSNSTopicService } from './topic/unsubscribe-sns-topic'
import { UpdateEndpointService } from './update'
import { UpdateDingTalkMsgService } from './update-ding-talk-msg'
import { UpdateEmailAddressToEndpointService } from './update-email-address-of-endpoint'
import { UpdateFeiShuMsgService } from './update-feishu-msg'
import { UpdateSmsReceiverService } from './update-sms-address'
import { UpdateWeComMsgService } from './update-wecom-msg'
import { ValidateAliyunSmsEndpointService } from './validate-sms-endpoint'

@Module({
  imports: [HttpModule],
  providers: [
    AddSNSDingTalkAtPersonService,
    RemoveSNSDingTalkAtPersonService,
    ModifyDingTalkAtPersonService,
    AddEmailAddressToEndpointService,
    UpdateEmailAddressToEndpointService,
    DeleteEmailAddressToEndpointService,
    AddSmsReceiverService,
    RemoveSmsReceiverService,
    ValidateAliyunSmsEndpointService,
    CreateSnmpTrapEndpointService,
    CreateDingTalkEndpointService,
    CreateEmailEndpointService,
    CreateHttpEndpointService,
    CreateAliyunSmsEndpointService,
    CreateSNSMicrosoftTeamsEndpointService,
    ChangeEndpointStateService,
    UpdateEndpointService,
    DeleteEndpointService,
    AddAlarmToEndpointService,
    RemoveAlarmFromEndpointService,
    UpdateSmsReceiverService,
    CreateSNSTopicService,
    SubscribeSNSTopicService,
    UnsubscribeSNSTopicService,
    DeleteSNSTopicService,
    CreateFeiShuEndpointService,
    CreateWeComEndpointService,
    TestConnectSNSEndPointService,
    UpdateDingTalkMsgService,
    UpdateFeiShuMsgService,
    UpdateWeComMsgService,
    SNSSnmpTestConnectionService,
    SNSEmailTestConnectionService
  ]
})
export class EndPointActionModule {}
