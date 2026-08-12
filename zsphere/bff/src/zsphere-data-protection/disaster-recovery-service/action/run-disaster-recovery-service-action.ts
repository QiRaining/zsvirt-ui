import { Inject } from '@nestjs/common'
import { Args, Mutation } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

import {
  RunDisasterRecoveryServiceActionInput,
  RunDisasterRecoveryServiceActionPayload
} from '../disaster-recovery-service.model'
import {
  DisasterRecoveryServiceMockStore,
  type DisasterRecoveryServiceOperation
} from '../mock-store'

const RESOURCE_UUID = 'zlr-disaster-recovery-service'

export class RunDisasterRecoveryServiceActionService extends ActionService {
  @Inject()
  private readonly store: DisasterRecoveryServiceMockStore

  @Mutation(() => ActionResult)
  runDisasterRecoveryServiceAction(@Args('input') input: RunDisasterRecoveryServiceActionInput) {
    const state = this.store.runOperation(
      input.payload.operation as DisasterRecoveryServiceOperation,
      input.payload
    )

    const actionFn = (_payload: RunDisasterRecoveryServiceActionPayload) =>
      Promise.resolve({
        id: RESOURCE_UUID,
        fields: 'status',
        inventory: state
      })

    this.actionHelper(input, 'DisasterRecoveryService', actionFn, {
      resourceUuids: [RESOURCE_UUID]
    })

    return { actionId: input.action.actionId }
  }
}
