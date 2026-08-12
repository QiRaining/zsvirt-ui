import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { reduce as _reduce, get as _get, uniq as _uniq } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ImageQueryService } from '@/zsphere-resource/image/image-query/image-query.service'

@Injectable()
export class ImageDataloader {
  @Inject() imageQueryService: ImageQueryService

  private imageDataloader

  private imageMap: any = {}

  constructor() {
    this.imageDataloader = new DataLoader(this._query)
  }

  query(uuid, imageUuid) {
    this.imageMap[uuid] = {
      uuid,
      imageUuid
    }
    return this.imageDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const imageUuids = uuids.map(uuid => this.imageMap[uuid].imageUuid)
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: _uniq(imageUuids) }],
      start: 0,
      limit: 1000
    }
    const resp = await this.imageQueryService.queryList(params)

    const images = _reduce(
      _get(resp, 'list', []),
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      return _get(images, _get(this.imageMap, [uuid, 'imageUuid'], null))
    })
  }
}
