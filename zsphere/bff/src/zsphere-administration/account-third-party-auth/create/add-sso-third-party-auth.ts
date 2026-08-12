import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  CreateCasClientAction,
  CreateCasClientResult as ICreateCasClientResult
} from '@/api/zstack/CreateCasClientAction'
import {
  CreateOAuthClientAction,
  CreateOAuthClientResult as ICreateOAuthClientResult
} from '@/api/zstack/CreateOAuthClientAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { UpdateSSORedirectTemplateAction } from '@/api/zstack/UpdateSSORedirectTemplateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'

@InputType()
class AddSSOThirdPartyAuthPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  clientType: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => String, { nullable: true })
  clientId: string

  @Field(() => String, { nullable: true })
  clientSecret: string

  @Field(() => String, { nullable: true })
  tokenUrl: string

  @Field(() => String, { nullable: true })
  authorizationUrl?: string

  @Field(() => String, { nullable: true })
  casServerLoginUrl: string

  @Field(() => String, { nullable: true })
  casServerUrlPrefix: string

  @Field(() => String, { nullable: true })
  serverName: string

  @Field(() => String)
  urlTemplate: string

  @Field(() => String)
  grantType: string

  @Field(() => String, { nullable: true })
  redirectUrl?: string

  @Field(() => String, { nullable: true })
  redirectTemplate?: string

  @Field(() => String, { nullable: true })
  userinfoUrl?: string

  @Field(() => String, { nullable: true })
  logoutUrl?: string
}

@InputType()
class AddSSOThirdPartyAuthInput {
  @Field(() => AddSSOThirdPartyAuthPayload)
  payload: AddSSOThirdPartyAuthPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSSOThirdPartyAuthService extends ActionService {
  @Inject() createOAuthClientAction: CreateOAuthClientAction
  @Inject() createCasClientAction: CreateCasClientAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateSSORedirectTemplateAction: UpdateSSORedirectTemplateAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  addSSOThirdPartyAuth(@Args('input') input: AddSSOThirdPartyAuthInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SSOThirdPartyAuthVO',
      async (payload: AddSSOThirdPartyAuthPayload, taskId: string) => {
        const { redirectTemplate, clientType, ...addSSOThirdPartyAuthActionParam } = payload
        let resp: ICreateOAuthClientResult | ICreateCasClientResult
        if (clientType === 'CAS') {
          resp = await this.createCasClientAction.call(
            { ...addSSOThirdPartyAuthActionParam },
            { actionId, taskId }
          )
        } else {
          resp = await this.createOAuthClientAction.call(
            { ...addSSOThirdPartyAuthActionParam },
            { actionId, taskId }
          )
        }
        const uuid = resp?.inventory?.uuid

        if (redirectTemplate) {
          let ssoRedirectTemplateUuid = ''
          try {
            const zqlObj = {
              tableName: 'ssoredirectTemplate',
              fields: 'uuid',
              condition: {
                clientUuid: uuid
              }
            }
            const { results } = await this.zqlService.call(ZQL.stringify(zqlObj))
            ssoRedirectTemplateUuid = results?.[0]?.inventories?.[0].uuid
          } catch (error) {
            console.log(error)
          }
          await this.updateSSORedirectTemplateAction.call(
            {
              redirectTemplate,
              uuid: ssoRedirectTemplateUuid
            },
            { actionId, taskId }
          )
        }

        return {
          id: actionId,
          inventory: resp?.inventory
        }
      }
    )
    return { actionId }
  }
}
