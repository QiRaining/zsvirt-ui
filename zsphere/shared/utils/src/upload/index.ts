import * as CryptoJS from "crypto-js";

export function blobToString(blob: Blob, encoding?: string): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const str = fileReader.result as string;
      resolve(str);
    };
    if (encoding) {
      fileReader.readAsText(blob, encoding);
    } else {
      fileReader.readAsBinaryString(blob);
    }
  });
}

export function stringToBase64(str: string): Promise<string> {
  return new Promise((resolve) => {
    resolve(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str)));
  });
}

export function blobToBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result as any);
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

export function blobToHash(blob: Blob): Promise<string> {
  const arr = [];
  const slice = (sliceBlob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result as any);
      };
      fileReader.readAsArrayBuffer(sliceBlob);
    });
  };
  let left = 0;
  let lastBlob = false;
  const chunk = 24 * 1024 * 1024;
  while (!lastBlob) {
    const right = left + chunk;
    if (right > blob.size) {
      lastBlob = true;
      arr.push(slice(blob.slice(left)));
    } else {
      arr.push(slice(blob.slice(left, right)));
    }
    left = right;
  }
  return Promise.all(arr).then((bufs) => {
    const hasher = CryptoJS.algo.SHA1.create();
    bufs.forEach((buf) => {
      hasher.update(CryptoJS.lib.WordArray.create(new Uint8Array(buf)));
    });

    return hasher.finalize().toString(CryptoJS.enc.Hex);
  });

  // return new Promise(resolve => {
  //   const fileReader = new FileReader()
  //   fileReader.onload = () => {
  //     resolve(fileReader.result as any)
  //   }
  //   fileReader.readAsArrayBuffer(blob)
  // })
}

export async function simpleHash(file: File) {
  const KB = 1024;
  function read(f: File, start: number, end: number): Promise<string> {
    if (f.size < end) {
      end = file.size;
    }
    const blob = f.slice(start, end);
    return blobToString(blob);
  }
  if (file.size < 32 * KB) {
    const str = await read(file, 0, file.size);
    return CryptoJS.MD5(str).toString(CryptoJS.enc.Hex);
  }
  const s = await read(file, 0, 5 * KB);
  const m = await read(
    file,
    Math.floor(file.size) / 2,
    Math.floor(file.size) / 2 + 5 * KB,
  );
  const e = await read(
    file,
    Math.floor(file.size) - 5 * KB,
    Math.floor(file.size),
  );
  const temp = CryptoJS.MD5(s + m + e).toString(CryptoJS.enc.Hex);
  return CryptoJS.MD5(temp + file.name + file.size).toString(CryptoJS.enc.Hex);
}

const getSessionId = () => {
  if (
    typeof localStorage === "undefined" ||
    typeof localStorage.getItem !== "function"
  ) {
    return "";
  }
  return localStorage.getItem("sessionId") || "";
};

interface Upload {
  hash: any;
  sliceIndex?: number;
  sliceSize: number;
  blob: Blob;
  offset: number;
}

export type UploadType = "image" | "storagePackage" | "migrationServicePackage";

interface UploadTargetBinding {
  artifactUuid: string;
  offset?: number;
  realUuid: string;
  uploadType?: UploadType;
  uploadUrl: string;
}

interface FlowData {
  sentSize: number;
  timing: number;
}

export interface UploadError {
  offset: number;
  status?: number;
  retryable: boolean;
  error?: string;
  serverOffset?: number;
  suggestedChunkSize?: number;
}

export interface UploadLifecycleContext {
  upload: FileUpload;
}

export interface UploadRecoverableErrorContext extends UploadLifecycleContext {
  error: UploadError;
}

export interface UploadWorkerConfig {
  workerPath?: string;
  interval?: number;
  targetUploadTime?: number;
  fileHash?: string;
  onComplete?: (context: UploadLifecycleContext) => void;
  onLaunch?: (context: UploadLifecycleContext) => void;
  onRecoverableUploadError?: (context: UploadRecoverableErrorContext) => void;
  onManualPause?: (context: UploadLifecycleContext) => void;
  onDestroy?: (context: UploadLifecycleContext) => void;
}

type WorkerRequestMessage =
  | { type: "START"; payload?: { interval?: number } }
  | { type: "STOP" }
  | { type: "PAUSE" }
  | { type: "RESUME" };

type WorkerResponseMessage = {
  type: "READY" | "TICK" | "STOPPED" | "PAUSED";
};

const DEFAULT_TARGET_UPLOAD_TIME = 20;
const MB = 1024 * 1024;

export class FileUpload {
  private file: File;

  private url: string;

  private realUuid: string;

  private artifactUuid: string;

  private next: number = 0;

  private lastSlice: boolean = false;

  private abort = false;

  //depends on medium material like normal RAM OR solid RAM
  private mediumSpeed = 0;

  //upload request pool
  private pool: Map<number, Upload>;

  //max size concurrent upload request
  private size = 4;

  //max size concurrent calc md5
  private parallelSize = 6;

  private parallel = new Map();

  private queue: Array<Upload> = [];

  private sentSize = 0;

  private sentObj = { sentSize: 0, timing: performance.now() };

  //retry map to track retry count for each chunk
  private retryMap: Map<number, number> = new Map();

  private retryTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();

  //xhr map to track in-flight requests
  private xhrMap: Map<number, XMLHttpRequest> = new Map();

  private initialUploadedSize = 0;

  private chunkProgressMap: Map<number, number> = new Map();

  private completedChunkSizeMap: Map<number, number> = new Map();

  private retryRecoveryPending = false;

  //max retry times for each chunk
  private maxRetry = 2;

  //max size ready to upload (calc md5 be done)
  private queueSize = 32;

  private speed = 0;

  private complete = false;

  private calcComplete = false;

  // private spark = new SparkMD5.ArrayBuffer()

  private staff = new Map<number, Worker>();

  // private employee = 3

  private flowWindow: Array<FlowData> = [];

  //store 3s flow and get an average(more accurate)
  private flowWindowSize = 3;

  private uploadType: UploadType = "image";

  private fileHash?: string;

  private onRecoverableUploadError?: (
    context: UploadRecoverableErrorContext,
  ) => void;

  private onComplete?: (context: UploadLifecycleContext) => void;

  private onLaunch?: (context: UploadLifecycleContext) => void;

  private onManualPause?: (context: UploadLifecycleContext) => void;

  private onDestroy?: (context: UploadLifecycleContext) => void;

  // 动态分片相关属性
  private isFirstChunk = true;

  // 最小分片大小 4MB，用作弱网探测首片和降级底线。
  private minChunkSize = 4 * 1024 * 1024;

  // 最大分片大小 256MB
  private maxChunkSize = 256 * 1024 * 1024;

  private degradedMaxChunkSize = 32 * 1024 * 1024;

  private adaptiveMaxChunkSize = this.maxChunkSize;

  private foregroundConcurrency = this.size;

  private backgroundConcurrency = 2;

  private backgroundMaxChunkSize = 32 * 1024 * 1024;

  // 目标上传时间由全局设置 upload.max.idle.duration.in.seconds 注入，默认保持旧 20 秒安全窗口
  private targetUploadTime = DEFAULT_TARGET_UPLOAD_TIME;

  private currentChunkIndex = 0;

  // Web Worker 相关：用于后台持续调度上传任务
  private schedulerWorker: Worker | null = null;

  private schedulerWorkerPath = "/upload-worker.js";

  // 调度间隔，保持上传响应性并避免调度过快
  private schedulerInterval = 10;

  private fallbackSchedulerTimer: ReturnType<typeof setTimeout> | null = null;

  // 是否使用 Worker
  private useSchedulerWorker = true;

  private schedulerStarted = false;

  private offlineListener?: () => void;

  private visibilityChangeListener?: () => void;

  private monitorCallbacks = new Set<
    (speed: number, complete: boolean) => void
  >();

  private monitorRunning = false;

  /** Get bytes sent so far. Used by clientProgress overlay. */
  getSentSize(): number {
    return this.sentSize;
  }

  /** Get total file size. Used by clientProgress overlay. */
  getFileSize(): number {
    return this.file.size;
  }

  constructor(
    file: File,
    url: string,
    realUuid: string,
    imageUuid: string,
    next: number,
    uploadType: UploadType = "image",
    mediumSpeed: number = 200,
    workerConfig?: UploadWorkerConfig,
  ) {
    this.file = file;
    this.url = url;
    this.artifactUuid = imageUuid;
    this.realUuid = realUuid;
    this.pool = new Map();
    this.next = next || 0;
    this.currentChunkIndex = this.getRestoredChunkIndex(this.next);
    this.initialUploadedSize = this.next;
    this.sentSize = this.next;
    this.sentObj = { sentSize: this.sentSize, timing: performance.now() };
    this.uploadType = uploadType;
    this.mediumSpeed = mediumSpeed;
    // 配置 Worker
    if (workerConfig?.workerPath) {
      this.schedulerWorkerPath = workerConfig.workerPath;
    }
    if (workerConfig?.interval !== undefined) {
      // 可以在这里使用 interval 配置
      this.schedulerInterval = workerConfig.interval;
    }
    this.setTargetUploadTime(workerConfig?.targetUploadTime);
    this.fileHash = workerConfig?.fileHash;
    this.onComplete = workerConfig?.onComplete;
    this.onLaunch = workerConfig?.onLaunch;
    this.onRecoverableUploadError = workerConfig?.onRecoverableUploadError;
    this.onManualPause = workerConfig?.onManualPause;
    this.onDestroy = workerConfig?.onDestroy;
    // 初始化 Worker
    this.initSchedulerWorker();
  }

  setTargetUploadTime(targetUploadTime?: number) {
    if (
      typeof targetUploadTime === "number" &&
      Number.isFinite(targetUploadTime) &&
      targetUploadTime > 0
    ) {
      this.targetUploadTime = targetUploadTime;
      return;
    }
    this.targetUploadTime = DEFAULT_TARGET_UPLOAD_TIME;
  }

  private getMapTotal(map: Map<number, number>) {
    return Array.from(map.values()).reduce((total, value) => total + value, 0);
  }

  private refreshSentSize() {
    this.sentSize = Math.min(
      this.file.size,
      this.initialUploadedSize +
        this.getMapTotal(this.completedChunkSizeMap) +
        this.getMapTotal(this.chunkProgressMap),
    );
    this.sentObj = { sentSize: this.sentSize, timing: performance.now() };
  }

  private recordChunkProgress(
    offset: number,
    loaded: number,
    sliceSize: number,
  ) {
    const currentLoaded = this.chunkProgressMap.get(offset) ?? 0;
    this.chunkProgressMap.set(
      offset,
      Math.min(sliceSize, Math.max(currentLoaded, loaded)),
    );
    this.refreshSentSize();
  }

  private clearChunkProgress(offset: number) {
    if (this.chunkProgressMap.delete(offset)) {
      this.refreshSentSize();
    }
  }

  private markChunkUploaded(offset: number, sliceSize: number) {
    this.chunkProgressMap.delete(offset);
    this.completedChunkSizeMap.set(offset, sliceSize);
    this.refreshSentSize();
  }

  private resetProgressToOffset(offset: number) {
    this.initialUploadedSize = offset;
    this.chunkProgressMap.clear();
    this.completedChunkSizeMap.clear();
    this.sentSize = offset;
    this.sentObj = { sentSize: this.sentSize, timing: performance.now() };
  }

  private clearRetryTimer(offset: number) {
    const timer = this.retryTimers.get(offset);
    if (timer) {
      clearTimeout(timer);
    }
    this.retryTimers.delete(offset);
  }

  private clearRetryTimers() {
    this.retryTimers.forEach((timer) => clearTimeout(timer));
    this.retryTimers.clear();
  }

  private clearFallbackSchedulerTimer() {
    if (!this.fallbackSchedulerTimer) {
      return;
    }
    clearTimeout(this.fallbackSchedulerTimer);
    this.fallbackSchedulerTimer = null;
  }

  private stopActiveTransfers() {
    this.retryRecoveryPending = false;
    this.clearRetryTimers();
    this.clearFallbackSchedulerTimer();
    this.xhrMap.forEach((xhr) => xhr.abort());
    this.xhrMap.clear();
  }

  private async createUploadChunk(
    offset: number,
    sliceSize: number,
    sliceIndex?: number,
  ): Promise<Upload> {
    const boundedSliceSize = Math.max(
      0,
      Math.min(sliceSize, this.file.size - offset),
    );
    const blob = this.file.slice(offset, offset + boundedSliceSize);
    const buffer =
      typeof blob.arrayBuffer === "function"
        ? await blob.arrayBuffer()
        : await blobToBuffer(blob);
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer));
    return {
      hash: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
      sliceIndex,
      sliceSize: boundedSliceSize,
      blob,
      offset,
    };
  }

  private discardGeneratedChunksFromOffset(offset: number) {
    this.queue = this.queue.filter((upload) => upload.offset < offset);

    this.pool.forEach((_upload, chunkOffset) => {
      if (chunkOffset < offset) {
        return;
      }
      this.xhrMap.get(chunkOffset)?.abort();
      this.xhrMap.delete(chunkOffset);
      this.pool.delete(chunkOffset);
      this.retryMap.delete(chunkOffset);
      this.clearRetryTimer(chunkOffset);
      this.clearChunkProgress(chunkOffset);
    });

    this.parallel.forEach((_sliceSize, chunkOffset) => {
      if (chunkOffset < offset) {
        return;
      }
      this.parallel.delete(chunkOffset);
      this.staff.get(chunkOffset)?.terminate();
      this.staff.delete(chunkOffset);
    });

    this.completedChunkSizeMap.forEach((_sliceSize, chunkOffset) => {
      if (chunkOffset >= offset) {
        this.completedChunkSizeMap.delete(chunkOffset);
      }
    });
  }

  private isBrowserOffline() {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  }

  private addOfflineListener() {
    if (this.offlineListener || typeof window === "undefined") {
      return;
    }
    this.offlineListener = () => {
      this.handleBrowserOffline();
    };
    window.addEventListener("offline", this.offlineListener);
  }

  private removeOfflineListener() {
    if (!this.offlineListener || typeof window === "undefined") {
      this.offlineListener = undefined;
      return;
    }
    window.removeEventListener("offline", this.offlineListener);
    this.offlineListener = undefined;
  }

  private isDocumentHidden() {
    return typeof document !== "undefined" && document.hidden;
  }

  private applyVisibilityUploadProfile() {
    if (this.isDocumentHidden()) {
      this.size = Math.min(
        this.foregroundConcurrency,
        this.backgroundConcurrency,
      );
      this.maxChunkSize = Math.min(
        this.adaptiveMaxChunkSize,
        this.backgroundMaxChunkSize,
      );
      return;
    }
    this.size = this.foregroundConcurrency;
    this.maxChunkSize = this.adaptiveMaxChunkSize;
  }

  private addVisibilityListener() {
    if (
      this.visibilityChangeListener ||
      typeof document === "undefined" ||
      typeof document.addEventListener !== "function"
    ) {
      return;
    }
    this.visibilityChangeListener = () => {
      this.applyVisibilityUploadProfile();
    };
    document.addEventListener(
      "visibilitychange",
      this.visibilityChangeListener,
    );
    this.applyVisibilityUploadProfile();
  }

  private removeVisibilityListener() {
    if (
      !this.visibilityChangeListener ||
      typeof document === "undefined" ||
      typeof document.removeEventListener !== "function"
    ) {
      this.visibilityChangeListener = undefined;
      return;
    }
    document.removeEventListener(
      "visibilitychange",
      this.visibilityChangeListener,
    );
    this.visibilityChangeListener = undefined;
  }

  getRealUuid() {
    return this.realUuid;
  }

  getUploadType() {
    return this.uploadType;
  }

  rebindUploadTarget({
    artifactUuid,
    offset = 0,
    realUuid,
    uploadType,
    uploadUrl,
  }: UploadTargetBinding) {
    this.abort = true;
    this.url = uploadUrl;
    this.realUuid = realUuid;
    this.artifactUuid = artifactUuid;
    if (uploadType) {
      this.uploadType = uploadType;
    }
    this.clearRetryTimers();
    this.stopActiveTransfers();
    this.queue = [];
    this.pool.clear();
    this.retryMap.clear();
    this.chunkProgressMap.clear();
    this.completedChunkSizeMap.clear();
    this.parallel.clear();
    this.staff.forEach((worker) => worker.terminate());
    this.staff.clear();
    this.flowWindow = [];
    this.next = offset;
    this.lastSlice = false;
    this.calcComplete = false;
    this.complete = false;
    this.retryRecoveryPending = false;
    this.schedulerStarted = false;
    this.isFirstChunk = offset === 0;
    this.currentChunkIndex = this.getRestoredChunkIndex(offset);
    this.resetProgressToOffset(offset);
    if (this.useSchedulerWorker && this.schedulerWorker) {
      this.postMessageToScheduler({ type: "PAUSE" });
    }
    this.removeOfflineListener();
  }

  async getFileHash() {
    if (!this.fileHash) {
      this.fileHash = await simpleHash(this.file);
    }
    return this.fileHash;
  }

  /**
   * 初始化 Web Worker
   */
  private initSchedulerWorker() {
    if (!this.useSchedulerWorker || typeof Worker === "undefined") {
      this.useSchedulerWorker = false;
      return;
    }

    try {
      this.schedulerWorker = new Worker(this.schedulerWorkerPath);
      this.schedulerWorker.addEventListener(
        "message",
        (event: MessageEvent<WorkerResponseMessage>) => {
          this.handleSchedulerMessage(event.data);
        },
      );
      this.schedulerWorker.addEventListener("error", () => {
        this.handleSchedulerWorkerUnavailable();
      });
    } catch {
      this.useSchedulerWorker = false;
      this.schedulerWorker = null;
    }
  }

  private handleSchedulerWorkerUnavailable() {
    this.useSchedulerWorker = false;
    this.schedulerWorker = null;
    if (this.schedulerStarted && !this.abort && !this.complete) {
      this.startFallbackScheduler();
    }
  }

  /**
   * 处理 Worker 消息
   */
  private handleSchedulerMessage(message: WorkerResponseMessage) {
    if (message.type === "TICK") {
      // Worker 触发调度
      this.setNextToPool();
    }
  }

  /**
   * 向 Worker 发送消息
   */
  private postMessageToScheduler(message: WorkerRequestMessage) {
    this.schedulerWorker?.postMessage(message);
  }

  /**
   * 销毁 Worker
   */
  private destroySchedulerWorker() {
    if (!this.schedulerWorker) {
      return;
    }
    this.postMessageToScheduler({ type: "STOP" });
    this.schedulerWorker.terminate();
    this.schedulerWorker = null;
  }

  /**
   * Sigmoid 函数，用于平滑地映射速度到分片大小
   * @param x 输入值（归一化后的速度）
   * @returns 0-1 之间的值
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private getSliceIndex(): number {
    return this.currentChunkIndex;
  }

  private getRestoredChunkIndex(offset: number): number {
    if (!Number.isFinite(offset) || offset <= 0) {
      return 0;
    }
    return Math.ceil(
      Math.min(offset, this.file.size) / (this.minChunkSize * 2),
    );
  }

  /**
   * 根据当前网速动态计算分片大小
   * 考虑并发数量，实际有效速度 = 当前速度 / 并发数
   */
  private calculateChunkSize(): number {
    // 第一片始终使用最小值 8MB
    if (this.isFirstChunk) {
      this.isFirstChunk = false;
      return this.minChunkSize;
    }

    // 如果没有速度数据，使用默认值
    if (this.speed === 0) {
      // 16MB 作为默认值
      return this.minChunkSize * 2;
    }

    // 计算每个并发连接的有效速度（字节/秒）
    const effectiveSpeedPerConnection = this.speed / this.size;

    // 计算理想的分片大小：速度 * 目标时间
    const idealChunkSize = effectiveSpeedPerConnection * this.targetUploadTime;

    // 将理想分片大小归一化到 0-10 的范围（用于 sigmoid 函数）
    // 使用对数尺度来处理速度范围很大的情况
    const normalizedSpeed = Math.log10(idealChunkSize / this.minChunkSize);

    // 使用 sigmoid 函数平滑映射
    // 将输入调整到 -5 到 5 的范围，使 sigmoid 函数的输出更分散
    const sigmoidInput = (normalizedSpeed - 1.5) * 2;
    const sigmoidOutput = this.sigmoid(sigmoidInput);

    // 将 sigmoid 输出映射到分片大小范围
    const chunkSize =
      this.minChunkSize +
      (this.maxChunkSize - this.minChunkSize) * sigmoidOutput;

    // 确保分片大小是 1MB 的整数倍，便于管理
    const roundedChunkSize = Math.round(chunkSize / MB) * MB;

    // 确保在最小和最大范围内
    return Math.max(
      this.minChunkSize,
      Math.min(this.maxChunkSize, roundedChunkSize),
    );
  }

  private parseUploadErrorBody(responseText?: string): {
    serverOffset?: number;
    suggestedChunkSize?: number;
  } {
    if (!responseText) {
      return {};
    }
    try {
      const body = JSON.parse(responseText) as {
        serverOffset?: unknown;
        suggestedChunkSize?: unknown;
      };
      const serverOffset = Number(body.serverOffset);
      const suggestedChunkSize = Number(body.suggestedChunkSize);
      return {
        ...(Number.isFinite(serverOffset) && serverOffset >= 0
          ? { serverOffset }
          : {}),
        ...(Number.isFinite(suggestedChunkSize) &&
        suggestedChunkSize >= this.minChunkSize
          ? { suggestedChunkSize }
          : {}),
      };
    } catch {
      return {};
    }
  }

  private isAdaptiveChunkFailure(error: UploadError) {
    return (
      error.status === 0 ||
      error.status === 413 ||
      error.status === 502 ||
      error.status === 504 ||
      (typeof error.status === "number" && error.status >= 500)
    );
  }

  private isOffsetConflictError(error: UploadError) {
    return error.status === 409 || error.status === 416;
  }

  private reduceChunkSizeAfterFailure(error: UploadError, failedSliceSize = 0) {
    if (!this.isAdaptiveChunkFailure(error)) {
      return;
    }
    const halvedAdaptiveChunkSize =
      Math.floor(this.adaptiveMaxChunkSize / 2 / MB) * MB;
    const halvedFailedChunkSize =
      failedSliceSize > 0
        ? Math.floor(failedSliceSize / 2 / MB) * MB
        : halvedAdaptiveChunkSize;
    const degradedChunkSize =
      failedSliceSize >= 64 * MB
        ? this.degradedMaxChunkSize
        : halvedFailedChunkSize;
    const nextAdaptiveMaxChunkSize =
      error.status === 413 && error.suggestedChunkSize
        ? Math.min(error.suggestedChunkSize, degradedChunkSize)
        : Math.min(halvedAdaptiveChunkSize, degradedChunkSize);
    this.adaptiveMaxChunkSize = Math.max(
      this.minChunkSize,
      Math.min(this.adaptiveMaxChunkSize, nextAdaptiveMaxChunkSize),
    );
    this.applyVisibilityUploadProfile();
  }

  private getReslicedRetrySize(poolObj: Upload) {
    const remainingSize = this.file.size - poolObj.offset;
    if (remainingSize <= 0) {
      return 0;
    }
    return Math.max(
      Math.min(this.minChunkSize, remainingSize),
      Math.min(poolObj.sliceSize, this.maxChunkSize, remainingSize),
    );
  }

  private shouldResliceChunkAfterFailure(error: UploadError, poolObj: Upload) {
    return (
      error.retryable &&
      this.isAdaptiveChunkFailure(error) &&
      this.getReslicedRetrySize(poolObj) < poolObj.sliceSize
    );
  }

  private prepareReslicedRetry(offset: number) {
    this.retryRecoveryPending = true;
    this.discardGeneratedChunksFromOffset(offset);
    this.resetProgressToOffset(offset);
    this.next = offset;
    this.lastSlice = false;
    this.calcComplete = false;
    this.complete = false;
  }

  private async sendReslicedRetry(poolObj: Upload, error: UploadError) {
    const retrySliceSize = this.getReslicedRetrySize(poolObj);
    if (retrySliceSize <= 0) {
      this.retryRecoveryPending = false;
      this.pauseForAutoResume({
        ...error,
        offset: poolObj.offset,
        retryable: true,
      });
      return;
    }
    const retryObj = await this.createUploadChunk(
      poolObj.offset,
      retrySliceSize,
      poolObj.sliceIndex,
    );
    if (this.abort) {
      this.retryRecoveryPending = false;
      return;
    }
    this.next = retryObj.offset + retryObj.sliceSize;
    this.pool.set(retryObj.offset, retryObj);
    this.retryRecoveryPending = false;
    this.send(retryObj);
  }

  private getRetryDelay(retryCount: number) {
    const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
    const jitterRatio = 0.2 + Math.random() * 0.2;
    return Math.max(0, Math.round(baseDelay * (1 - jitterRatio)));
  }

  private startFallbackScheduler() {
    this.clearFallbackSchedulerTimer();
    const initPool = () => {
      if (this.abort) {
        this.fallbackSchedulerTimer = null;
        return;
      }
      this.setNextToPool();
      this.fallbackSchedulerTimer = setTimeout(
        () => initPool(),
        this.schedulerInterval,
      );
    };
    initPool();
  }

  request(
    hash: string,
    sliceSize: number,
    blob: Blob,
    offset: number,
    sliceIndex = this.getSliceIndex(),
  ): Promise<number> {
    const xhr = new XMLHttpRequest();
    const promise = new Promise<number>((resolve, reject) => {
      // 设置超时时间（5分钟，与后端保持一致）
      xhr.timeout = 300000;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          this.xhrMap.delete(offset);
          if (xhr.status === 200) {
            this.markChunkUploaded(offset, sliceSize);
            resolve(offset);
          } else if (xhr.status === 406) {
            // 406 表示服务端已有该分片，按成功跳过处理，避免重复重传。
            this.markChunkUploaded(offset, sliceSize);
            resolve(offset);
          } else if (xhr.status === 409 || xhr.status === 416) {
            this.clearChunkProgress(offset);
            reject({
              offset,
              status: xhr.status,
              retryable: true,
              error: `HTTP ${xhr.status}`,
              ...this.parseUploadErrorBody(xhr.responseText),
            });
          } else if (
            xhr.status === 413 ||
            xhr.status === 502 ||
            xhr.status === 504 ||
            xhr.status >= 500 ||
            xhr.status === 0
          ) {
            this.clearChunkProgress(offset);
            // 分片过大、网关错误、网络错误或服务端错误，可以重试
            reject({
              offset,
              status: xhr.status,
              retryable: true,
              error: `HTTP ${xhr.status}`,
              ...this.parseUploadErrorBody(xhr.responseText),
            });
          } else {
            this.clearChunkProgress(offset);
            // 其他客户端错误（4xx），不可重试
            reject({
              offset,
              status: xhr.status,
              retryable: false,
              error: `HTTP ${xhr.status}`,
            });
          }
        }
      };

      // 处理超时
      xhr.ontimeout = () => {
        this.xhrMap.delete(offset);
        this.clearChunkProgress(offset);
        reject({
          offset,
          status: 0,
          retryable: true,
          error: "Request timeout",
        });
      };

      // 处理网络错误
      xhr.onerror = () => {
        this.xhrMap.delete(offset);
        this.clearChunkProgress(offset);
        reject({
          offset,
          status: 0,
          retryable: true,
          error: "Network error",
        });
      };

      // 处理请求中止
      xhr.onabort = () => {
        this.xhrMap.delete(offset);
        this.clearChunkProgress(offset);
        reject({
          offset,
          status: 0,
          retryable: false,
          error: "Request aborted",
        });
      };
    });
    xhr.upload.addEventListener("progress", (event) => {
      this.recordChunkProgress(offset, event.loaded, sliceSize);
    });

    const endpointMap = {
      storagePackage: "/api/uploadStoragePackage",
      migrationServicePackage: "/api/uploadMigrationServicePackage",
      image: "/api/imageupload",
    };

    const endpoint = endpointMap[this.uploadType as keyof typeof endpointMap];

    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Content-MD5", hash);
    xhr.setRequestHeader("X-SLICE-HASH", hash);
    xhr.setRequestHeader("X-HASH-ALGORITHM", "MD5");
    xhr.setRequestHeader(
      "Content-Range",
      `bytes ${offset}-${offset + sliceSize - 1}/${this.file.size}`,
    );
    xhr.setRequestHeader("TRANSIT", this.url);
    xhr.setRequestHeader("JOB-ID", this.realUuid);
    const sessionId = getSessionId();
    if (sessionId) {
      xhr.setRequestHeader("X-SESSION-ID", sessionId);
    }
    xhr.setRequestHeader("X-SLICE-SIZE", sliceSize as any);
    xhr.setRequestHeader("X-SLICE-OFFSET", offset as any);
    xhr.setRequestHeader("X-SLICE-INDEX", sliceIndex as any);

    if (this.uploadType === "image") {
      xhr.setRequestHeader("X-IMAGE-UUID", this.artifactUuid);
      xhr.setRequestHeader("X-IMAGE-SIZE", this.file.size as any);
    } else {
      xhr.setRequestHeader("X-FILE-UUID", this.artifactUuid);
      xhr.setRequestHeader("X-FILE-SIZE", this.file.size as any);
    }

    const fd = new FormData();
    const formFieldName =
      endpointMap[this.uploadType as keyof typeof endpointMap];
    fd.append(formFieldName, blob);
    this.xhrMap.set(offset, xhr);
    xhr.send(fd);
    return promise;
  }

  pushQueue(data: Upload) {
    this.queue.push(data);
    this.parallel.delete(data.offset);
    if (this.lastSlice && this.parallel.size === 0) {
      this.calcComplete = true;
    }
  }

  async *genNext() {
    // 如果已经是最后一片，直接返回
    if (this.lastSlice) {
      yield;
      return;
    }
    // 如果 MD5 计算并发或待上传队列已满，等待下一轮调度
    if (
      this.parallel.size >= this.parallelSize ||
      this.queue.length >= this.queueSize
    ) {
      yield;
      return;
    }
    // 动态计算当前分片大小
    const dynamicChunkSize = this.calculateChunkSize();
    const end = this.next + dynamicChunkSize;
    let sliceSize = dynamicChunkSize;
    if (end > this.file?.size) {
      this.lastSlice = true;
      sliceSize = this.file.size - this.next;
    }

    // const blob = this.lastSlice ? this.file.slice(this.next) : this.file.slice(this.next, end)

    const offset = this.next;

    this.next = Math.min(end, this.file.size);
    // if (this.staff.size < this.employee) {

    // } else {
    //   blobToBuffer(blob).then(buf => {
    //     this.spark.append(buf)
    //     const hash = this.spark.end()
    //     this.pushQueue({ hash, sliceSize, blob, offset })
    //   })
    // }
    const sliceIndex = this.currentChunkIndex;
    this.work(offset, sliceSize, sliceIndex);
    this.parallel.set(offset, sliceSize);
    this.currentChunkIndex += 1;
    yield;
  }

  setNextToPool() {
    if (this.abort || this.retryRecoveryPending) {
      return;
    }
    this.genNext().next();
    if (this.pool.size < this.size) {
      const obj = this.queue.shift() as Upload;

      if (obj) {
        this.pool.set(obj.offset, obj);
        this.send(obj);
      }
    }
    this.markCompleteIfDone();
  }

  private emitMonitorUpdate() {
    this.monitorCallbacks.forEach((callBack) =>
      callBack(this.speed, this.complete),
    );
  }

  monitor(callBack: (speed: number, complete: boolean) => void) {
    this.monitorCallbacks.add(callBack);
    if (this.monitorRunning) {
      return () => {
        this.monitorCallbacks.delete(callBack);
      };
    }
    this.monitorRunning = true;

    const timer = () => {
      if (this.abort) {
        this.emitMonitorUpdate();
        this.monitorRunning = false;
        return;
      }
      // 推入当前快照（创建新对象，避免引用问题）
      this.flowWindow.push({
        sentSize: this.sentSize,
        timing: performance.now(),
      });
      if (this.flowWindow.length > this.flowWindowSize) {
        this.flowWindow.shift();
      }
      setTimeout(() => {
        this.speed = 0;
        if (!(this.abort || this.flowWindow.length !== this.flowWindowSize)) {
          // 基于最近 3 秒窗口计算平均速度，避免瞬时进度抖动
          const size = Math.max(
            0,
            this.flowWindow[this.flowWindow.length - 1].sentSize -
              this.flowWindow[0].sentSize,
          );
          const time =
            (this.flowWindow[this.flowWindow.length - 1].timing -
              this.flowWindow[0].timing) /
            1000;
          const speed = time > 0 ? size / time : 0;
          this.speed = Number.isFinite(speed) ? speed : 0;
        }
        this.emitMonitorUpdate();
        if (!this.abort) {
          timer();
        } else {
          this.monitorRunning = false;
        }
      }, 1000);
    };
    timer();
    return () => {
      this.monitorCallbacks.delete(callBack);
    };
  }

  work(offset: number, sliceSize: number, sliceIndex?: number) {
    const finish = (data: Upload) => {
      this.pushQueue(data);
      this.staff.get(offset)?.terminate();
      this.staff.delete(offset);
    };

    if (typeof Worker === "undefined") {
      const blob = this.file.slice(offset, offset + sliceSize);
      blobToBuffer(blob).then((buf) => {
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buf));
        finish({
          hash: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
          sliceIndex,
          sliceSize,
          blob,
          offset,
        });
      });
      return;
    }

    try {
      const worker = new Worker("/vendor/worker.js");
      this.staff.set(offset, worker);
      // eslint-disable-next-line unicorn/require-post-message-target-origin -- Worker.postMessage does not accept targetOrigin.
      worker.postMessage({ type: "one", offset, file: this.file, sliceSize });
      worker.onmessage = (e: MessageEvent<Upload>) => {
        if (e.data.offset === offset) {
          finish({ ...e.data, sliceIndex });
        }
      };
    } catch {
      const blob = this.file.slice(offset, offset + sliceSize);
      blobToBuffer(blob).then((buf) => {
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buf));
        finish({
          hash: CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex),
          sliceIndex,
          sliceSize,
          blob,
          offset,
        });
      });
    }
  }

  private markCompleteIfDone() {
    if (this.complete) {
      return;
    }
    if (
      this.calcComplete &&
      this.pool.size === 0 &&
      this.queue.length === 0 &&
      this.parallel.size === 0 &&
      this.staff.size === 0
    ) {
      this.abort = true;
      this.complete = true;
      this.speed = 0;
      this.clearRetryTimers();
      this.clearFallbackSchedulerTimer();
      if (this.useSchedulerWorker && this.schedulerWorker) {
        this.postMessageToScheduler({ type: "STOP" });
      }
      this.removeOfflineListener();
      this.removeVisibilityListener();
      this.schedulerStarted = false;
      this.onComplete?.({ upload: this });
    }
  }

  launch() {
    this.abort = false;
    this.schedulerStarted = true;
    this.onLaunch?.({ upload: this });
    this.clearFallbackSchedulerTimer();
    this.addOfflineListener();
    this.addVisibilityListener();
    if (this.isBrowserOffline()) {
      this.handleBrowserOffline();
      return;
    }
    // 自动启动速度监控器
    this.monitor(() => {});

    if (this.useSchedulerWorker && this.schedulerWorker) {
      // 使用 Web Worker 调度，避免浏览器标签页切换或最小化时 requestAnimationFrame 停止
      this.postMessageToScheduler({
        type: "START",
        payload: { interval: this.schedulerInterval },
      });
      return;
    }

    // 降级方案：使用 setTimeout
    this.startFallbackScheduler();
  }

  send(obj?: Upload) {
    if (!obj || this.abort) {
      return;
    }
    const { hash, sliceIndex, sliceSize, blob, offset } = obj;
    this.request(hash, sliceSize, blob, offset, sliceIndex).then(
      (_offset) => {
        this.pool.delete(_offset);
        // 上传成功后清除重试计数
        this.retryMap.delete(_offset);
        this.clearRetryTimer(_offset);
        // 检查是否所有分片都已上传完成
        this.markCompleteIfDone();
      },
      (error: UploadError) => {
        // 处理新的错误对象格式
        const _offset = error?.offset;
        const poolObj = this.pool.get(_offset);
        if (!poolObj || this.abort) {
          return;
        }

        // 获取当前重试次数
        const retryCount = this.retryMap.get(_offset) || 0;
        if (this.isOffsetConflictError(error)) {
          this.pool.delete(_offset);
          this.retryMap.delete(_offset);
          this.clearRetryTimer(_offset);
          this.clearChunkProgress(_offset);
          this.abort = true;
          this.complete = false;
          this.stopActiveTransfers();
          if (this.useSchedulerWorker && this.schedulerWorker) {
            this.postMessageToScheduler({ type: "STOP" });
          }
          this.onRecoverableUploadError?.({ upload: this, error });
          return;
        }
        this.reduceChunkSizeAfterFailure(error, poolObj.sliceSize);
        // 判断是否可以重试
        if (error.retryable && retryCount < this.maxRetry) {
          const shouldReslice = this.shouldResliceChunkAfterFailure(
            error,
            poolObj,
          );
          if (shouldReslice) {
            this.prepareReslicedRetry(_offset);
          }
          // 增加重试计数
          this.retryMap.set(_offset, retryCount + 1);
          // 延迟重试，避免立即重试加重服务器负担
          // 指数退避，最多5秒
          const retryDelay = this.getRetryDelay(retryCount);
          this.clearRetryTimer(_offset);
          const retryTimer = setTimeout(() => {
            this.retryTimers.delete(_offset);
            if (!this.abort) {
              if (shouldReslice) {
                this.sendReslicedRetry(poolObj, error).catch(() => {
                  this.retryRecoveryPending = false;
                  this.pauseForAutoResume(error);
                });
                return;
              }
              this.send(poolObj);
            }
          }, retryDelay);
          this.retryTimers.set(_offset, retryTimer);
          return;
        }

        this.pool.delete(_offset);
        this.retryMap.delete(_offset);
        this.clearRetryTimer(_offset);
        this.clearChunkProgress(_offset);
        // 不可重试或超过重试次数，标记为终止上传
        this.abort = true;
        this.complete = false;
        this.stopActiveTransfers();
        if (this.useSchedulerWorker && this.schedulerWorker) {
          // 停止 Worker
          this.postMessageToScheduler({ type: "STOP" });
        }
        if (error.retryable) {
          this.onRecoverableUploadError?.({ upload: this, error });
        }
      },
    );
  }

  private pauseForAutoResume(error: UploadError) {
    this.abort = true;
    this.speed = 0;
    this.stopActiveTransfers();
    this.queue = [];
    this.pool.clear();
    this.retryMap.clear();
    this.chunkProgressMap.clear();
    this.refreshSentSize();
    this.parallel.clear();
    this.staff.forEach((worker) => worker.terminate());
    this.staff.clear();
    if (this.useSchedulerWorker && this.schedulerWorker) {
      this.postMessageToScheduler({ type: "PAUSE" });
    }
    this.removeOfflineListener();
    this.schedulerStarted = false;
    this.onRecoverableUploadError?.({ upload: this, error });
  }

  private handleBrowserOffline() {
    if (this.abort || this.complete) {
      return;
    }
    this.pauseForAutoResume({
      offset: this.sentSize,
      status: 0,
      retryable: true,
      error: "Browser offline",
    });
  }

  pause() {
    this.abort = true;
    this.speed = 0;
    this.stopActiveTransfers();
    // Clear queue and pool
    this.queue = [];
    this.pool.clear();
    this.retryMap.clear();
    this.chunkProgressMap.clear();
    this.refreshSentSize();
    this.parallel.clear();
    this.staff.forEach((worker) => worker.terminate());
    this.staff.clear();
    if (this.useSchedulerWorker && this.schedulerWorker) {
      // 暂停 Worker
      this.postMessageToScheduler({ type: "PAUSE" });
    }
    this.removeOfflineListener();
    this.removeVisibilityListener();
    this.schedulerStarted = false;
    this.onManualPause?.({ upload: this });
  }

  resume(serverOffset?: number) {
    this.abort = false;
    this.schedulerStarted = true;
    this.clearRetryTimers();
    this.clearFallbackSchedulerTimer();
    this.addOfflineListener();
    this.addVisibilityListener();
    if (this.isBrowserOffline()) {
      this.handleBrowserOffline();
      return;
    }
    // If server offset provided, reset state to server's actual position
    if (serverOffset !== undefined) {
      this.next = serverOffset;
      this.resetProgressToOffset(serverOffset);
      this.lastSlice = false;
      this.calcComplete = false;
      this.complete = false;
      this.queue = [];
      this.pool.clear();
      this.xhrMap.clear();
      this.retryMap.clear();
      this.chunkProgressMap.clear();
      this.completedChunkSizeMap.clear();
      this.parallel.clear();
      this.staff.forEach((worker) => worker.terminate());
      this.staff.clear();
      this.flowWindow = [];
      this.retryRecoveryPending = false;
      this.isFirstChunk = false;
      this.currentChunkIndex = this.getRestoredChunkIndex(serverOffset);
    }
    if (this.useSchedulerWorker && this.schedulerWorker) {
      this.onLaunch?.({ upload: this });
      // 恢复 Worker
      this.postMessageToScheduler({ type: "RESUME" });
      return;
    }
    this.launch();
  }

  /**
   * 销毁上传实例，清理资源
   */
  destroy() {
    this.abort = true;
    this.schedulerStarted = false;
    this.stopActiveTransfers();
    this.queue = [];
    this.pool.clear();
    this.retryMap.clear();
    this.chunkProgressMap.clear();
    this.completedChunkSizeMap.clear();
    this.parallel.clear();
    this.staff.forEach((worker) => worker.terminate());
    this.staff.clear();
    this.destroySchedulerWorker();
    this.removeOfflineListener();
    this.removeVisibilityListener();
    this.onDestroy?.({ upload: this });
  }

  remainTime() {
    const mediumDelay =
      Math.ceil(this.file.size / (this.mediumSpeed * 1024 * 1024)) * 1000;
    if (this.speed === 0) {
      return mediumDelay;
    }
    let temp =
      (1000 * (this.file.size - this.sentSize)) / this.speed + mediumDelay;
    if (temp <= 1000) {
      temp = 1000;
    }
    return temp;
  }
}
