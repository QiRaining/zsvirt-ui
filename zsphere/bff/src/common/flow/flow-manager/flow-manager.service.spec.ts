import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '../../../app.module'

describe('FlowManagerService', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    // console.log(moduleFixture.get('FlowManagerService'));
    console.log(moduleFixture.get('AppService'))

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  // it('getService', () => {})
})

// import { Test, TestingModule } from '@nestjs/testing';
// import { FlowManagerService } from './flow-manager.service';

// describe('FlowManagerService', () => {
//   let service: FlowManagerService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [FlowManagerService],
//     }).compile();

//     service = module.get<FlowManagerService>(FlowManagerService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
