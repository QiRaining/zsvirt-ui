export function extractUpgradeVersionFromJobData(jobData: string): string {
  try {
    const parsedJobData = JSON.parse(jobData || '{}')
    const url = parsedJobData.url || ''
    const versionMatch = url.match(/(\d+(?:\.\d+){2,3})/)
    return versionMatch?.[1] ?? ''
  } catch {
    return ''
  }
}
