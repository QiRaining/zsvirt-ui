import { Test, TestingModule } from '@nestjs/testing'

import { ImageQueryService } from './image-query.service'

describe('ImageQueryService', () => {
  let service: ImageQueryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageQueryService]
    }).compile()

    service = module.get<ImageQueryService>(ImageQueryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
