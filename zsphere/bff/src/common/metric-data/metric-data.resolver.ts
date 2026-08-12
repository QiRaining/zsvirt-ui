import { Inject } from '@nestjs/common'
import { Args, Resolver, Query } from '@nestjs/graphql'

import { MetricDataQueryService } from './metric-data-query/metric-data-query.service'
import {
  BatchZQLGetMetricDataListArgsList,
  BatchZQLGetMetricDataListRes,
  MetricData,
  MetricLabelValue,
  QueryMetricDataArgs,
  QueryMetricDataListArgs,
  QueryMetricLabelValueArgs,
  ZQLGetMetricDataListArgs
} from './metric-data.model'
import { MetricDataService } from './metric-data.service'

@Resolver(() => MetricData)
export class MetricDataResolver {
  @Inject() metricDataService: MetricDataService
  @Inject() metricDataQueryService: MetricDataQueryService

  @Query(() => [MetricData])
  async metricData(@Args() queryArgs: QueryMetricDataArgs) {
    const { namespace, startTime, endTime, period, metricName, conditions } = queryArgs
    return await this.metricDataService.getMetricData(
      namespace,
      startTime,
      endTime,
      period,
      metricName,
      conditions
    )
  }

  @Query(() => [[MetricData]])
  async metricDataList(@Args() queryArgs: QueryMetricDataListArgs) {
    const { namespace, startTime, endTime, period, metricList } = queryArgs
    return await this.metricDataService.getMetricDataList(
      namespace,
      startTime,
      endTime,
      period,
      metricList
    )
  }

  @Query(() => [MetricData])
  async getMetricDataList(@Args() queryArgs: ZQLGetMetricDataListArgs) {
    return await this.metricDataQueryService.queryList(queryArgs)
  }

  @Query(() => [BatchZQLGetMetricDataListRes])
  async batchGetMetricDataList(@Args() queryArgs: BatchZQLGetMetricDataListArgsList) {
    const { argsList } = queryArgs
    const callList = argsList.map(item => {
      return this.metricDataQueryService.queryList(item.args)
    })
    const resultList = await Promise.all(callList)
    const res = resultList.map((list, index) => {
      const name = argsList[index].name
      return {
        name,
        list
      }
    })
    return res
  }

  @Query(() => [MetricLabelValue])
  async metricLabelValueList(@Args() queryArgs: QueryMetricLabelValueArgs) {
    const { namespace, metricName, labelName, filterLabels, startTime, endTime } = queryArgs
    return await this.metricDataService.getMetricLabelValue(
      namespace,
      metricName,
      labelName,
      filterLabels,
      startTime,
      endTime
    )
  }
}
