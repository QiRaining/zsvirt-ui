/**
 * Upload Worker - 用于在后台持续调度上传任务
 * 解决浏览器标签页切换或最小化时 requestAnimationFrame 停止的问题
 */

let timerId = null;
let isRunning = false;
let currentInterval = 10; // 默认间隔 10ms

// 接收主线程消息
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "START":
      startScheduler(payload);
      break;
    case "STOP":
      stopScheduler();
      break;
    case "PAUSE":
      pauseScheduler();
      break;
    case "RESUME":
      resumeScheduler();
      break;
    default:
      console.warn("[Upload Worker] Unknown message type:", type);
  }
});

/**
 * 启动调度器
 */
function startScheduler(config = {}) {
  const { interval = 10 } = config;
  currentInterval = interval;

  if (isRunning) {
    console.log("[Upload Worker] Scheduler already running");
    return;
  }

  isRunning = true;
  console.log(
    "[Upload Worker] Scheduler started with interval:",
    interval,
    "ms",
  );

  function tick() {
    if (!isRunning) {
      return;
    }

    // 通知主线程执行上传任务
    self.postMessage({ type: "TICK" });

    // 继续下一次调度
    timerId = setTimeout(tick, currentInterval);
  }

  tick();
}

/**
 * 停止调度器
 */
function stopScheduler() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  isRunning = false;
  console.log("[Upload Worker] Scheduler stopped");
  self.postMessage({ type: "STOPPED" });
}

/**
 * 暂停调度器
 */
function pauseScheduler() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  isRunning = false;
  console.log("[Upload Worker] Scheduler paused");
  self.postMessage({ type: "PAUSED" });
}

/**
 * 恢复调度器
 */
function resumeScheduler() {
  if (!isRunning) {
    startScheduler();
  }
}

// Worker 初始化完成
self.postMessage({ type: "READY" });
console.log("[Upload Worker] Initialized");
