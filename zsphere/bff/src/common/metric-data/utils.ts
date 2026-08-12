const formatMetricValueList = ({
  metricName,
  dataList,
  startTime = 0,
  endTime = 0,
  period = 1,
  fill = null
}) => {
  const result = []
  for (let time = startTime; time <= endTime; time = time + period) {
    const hasData = dataList.some(data => {
      if (parseInt(data.time, 10) === time) {
        result.push({
          metricName,
          time: +time * 1000,
          value: data.value,
          type: metricName
        })
        return true
      }
    })
    if (!hasData) {
      result.push({
        metricName,
        time: +time * 1000,
        value: fill,
        type: metricName
      })
    }
  }
  return result
}

export { formatMetricValueList }
