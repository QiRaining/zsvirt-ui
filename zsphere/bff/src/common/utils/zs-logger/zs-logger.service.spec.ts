import { Test, TestingModule } from '@nestjs/testing'

import { ZsLoggerService } from './zs-logger.service'

describe('ZsLoggerService', () => {
  let service: ZsLoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZsLoggerService]
    }).compile()

    service = module.get<ZsLoggerService>(ZsLoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
