import { Test, TestingModule } from '@nestjs/testing'

import { ActionSubscriptionResolver } from './action-subscription.resolver'

describe('ActionSubscriptionResolver', () => {
  let resolver: ActionSubscriptionResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionSubscriptionResolver]
    }).compile()

    resolver = module.get<ActionSubscriptionResolver>(ActionSubscriptionResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
