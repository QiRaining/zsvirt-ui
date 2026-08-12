import { Test, TestingModule } from '@nestjs/testing'

import { ZopsHttpService } from './zops-http-service.service'

describe('ZopsHttpService', () => {
  let service: ZopsHttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZopsHttpService]
    }).compile()

    service = module.get<ZopsHttpService>(ZopsHttpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
