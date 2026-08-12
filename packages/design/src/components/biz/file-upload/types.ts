interface Chunk {
  // 上一帧偏移量，用来动态计算这一帧的大小
  offset: number;
  // 当前已经上传完成的大小
  current: number;
  // 当前的帧计数
  count: number;
  // 当前帧大小
  size: number;
}
