import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '../../../app.module'
import { FlowModule } from '../flow.module'
import { FlowInstanceService } from './flow-instance.service'

describe('FlowInstanceService', () => {
  let service: FlowInstanceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FlowModule, AppModule],
      providers: [FlowInstanceService]
    }).compile()

    service = module.get<FlowInstanceService>(FlowInstanceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
