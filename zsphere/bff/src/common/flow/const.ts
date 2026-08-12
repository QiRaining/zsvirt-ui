export default {
  state: {
    READY: 'READY',
    RUNNING: 'RUNNING',
    ROLLINGBACK: 'ROLLINGBACK',
    STOPPING: 'STOPPING',
    STOPPED: 'STOPPED',
    ABORTED: 'ABORTED',
    FINISHED: 'FINISHED',
    CANCELED: 'CANCELED',
    ROLLEDBACK: 'ROLLEDBACK'
  },
  flow: {
    SERIAL: 'serialFlow',
    PARALLEL: 'parallelFlow'
  }
}
