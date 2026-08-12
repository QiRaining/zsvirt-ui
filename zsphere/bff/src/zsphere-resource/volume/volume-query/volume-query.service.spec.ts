import { Test, TestingModule } from '@nestjs/testing'

import { VolumeQueryService } from './volume-query.service'

describe('VolumeQueryService', () => {
  let service: VolumeQueryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VolumeQueryService]
    }).compile()

    service = module.get<VolumeQueryService>(VolumeQueryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
