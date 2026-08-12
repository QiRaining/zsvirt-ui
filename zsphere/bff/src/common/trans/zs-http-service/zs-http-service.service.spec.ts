import { Test, TestingModule } from '@nestjs/testing'

import { ZsHttpService } from './zs-http-service.service'

describe('ZsHttpServiceService', () => {
  let service: ZsHttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZsHttpService]
    }).compile()

    service = module.get<ZsHttpService>(ZsHttpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
