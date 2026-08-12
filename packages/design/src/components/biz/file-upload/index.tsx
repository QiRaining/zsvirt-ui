import { useRef, useState } from "react";

import { Button } from "../../primitive/button.tsx";
import { Progress } from "../../primitive/progress.tsx";
import { calcHashSample } from "./utils/calc-file-hash.ts";
import { post, request } from "./utils/request.ts";

enum Status {
  wait = "wait",
  pause = "pause",
  uploading = "uploading",
  error = "error",
  done = "done",
}

export const UploadFile = () => {
  const [fileList, setFileList] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [status, setStatus] = useState(Status.wait);
  const [progress, setProgress] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const requestList = useRef([]);
  const paused = useRef(false);
  const chunkList = useRef<Chunk[]>([]);
  const handleFileChange = async (e: any) => {
    const files = (e.target as HTMLInputElement)?.files as FileList;
    if (!files.length) {
      return;
    }
    setFileList(files[0]);
    console.time("calcHashSample");
    const res = await calcHashSample(files[0]);
    console.timeEnd("calcHashSample");
    console.log("calcHashSample抽样计算hash" + files[0].name, res);
    setStatus(Status.wait);
    setProgress(0);
  };

  const handlePause = () => {
    paused.current = true;
    setStatus(Status.pause);
    // @ts-expect-error
    requestList.current.forEach((xhr) => xhr?.abort());
    requestList.current = [];
  };

  const handleResume = async () => {
    paused.current = false;
    setStatus(Status.uploading);
    const lastChunk = chunkList.current[chunkList.current.length - 1];
    await execUpload(
      fileList!,
      fileSize,
      fileHash!,
      lastChunk.current,
      lastChunk.offset,
      lastChunk.count + 1,
    );
    if (!paused.current) {
      await mergeRequest(
        [0, 2 * 1024 * 1024, ...chunkList.current.map((item) => item.offset)],
        fileHash!,
      );
      setStatus(Status.done);
    }
  };

  const verify = async (filename: string, hash: string) => {
    const data = await post("/verify", { filename, hash });
    return data;
  };

  const mergeRequest = async (chunkSize: number[], fileHash: string) => {
    await post("/merge", {
      filename: fileList!.name,
      size: chunkSize,
      fileHash,
    });
    setProgress(100);
  };

  const humanReadableBytes = (bytes: number) => {
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    return `${parseFloat((bytes / 1024 ** i).toFixed(2))} ${sizes[i]}`;
  };

  const execUpload = async (
    file: File,
    _fileSize: number,
    _fileHash: string,
    cur: number,
    offset: number,
    count: number,
  ) => {
    while (cur < _fileSize) {
      if (paused.current) {
        break;
      }
      const chunk = file.slice(cur, cur + offset);
      cur += offset;
      setProgress((cur / _fileSize) * 100);
      const chunkName = _fileHash + "-" + count;
      const form = new FormData();
      form.append("chunk", chunk);
      form.append("hash", chunkName);
      form.append("filename", file.name);
      form.append("fileHash", _fileHash);
      form.append("size", chunk.size.toString());
      console.log(
        chunk,
        chunkName,
        file.name,
        _fileHash,
        chunk.size.toString(),
      );
      const start = new Date().getTime();
      await request({
        url: "/upload",
        data: form,
        requestList: requestList.current,
      });
      const now = new Date().getTime();
      const time = ((now - start) / 1000).toFixed(4);
      let rate = Number(time) / 10;
      // 速率有最大和最小 可以考虑更平滑的过滤 比如1/tan
      if (rate < 0.5) {
        rate = 0.5;
      }
      if (rate > 2) {
        rate = 2;
      }
      // 新的切片大小等比变化
      console.log(
        `切片${count}大小是${humanReadableBytes(offset)},耗时${time}秒，是10秒的${rate}倍，修正大小为${humanReadableBytes(offset / rate)}`,
      );
      const newOffset = parseInt((offset / rate).toString());
      chunkList.current.push({
        offset: newOffset,
        current: cur,
        count,
        size: offset,
      });
      offset = newOffset;
      // chunkSize.push(offset);
      count++;
    }
  };

  const uploadFile = async () => {
    // @todo数据缩放的比率 可以更平缓
    // @todo 并发+慢启动
    // 慢启动上传逻辑
    const file = fileList;
    if (!file) {
      return;
    }
    // status.value = Status.uploading;
    setStatus(Status.uploading);
    const _fileSize = file.size;
    setFileSize(_fileSize);
    const offset = 2 * 1024 * 1024;
    const cur = 0;
    const count = 0;
    // const chunksSize = [0, 2 * 1024 * 1024];
    const obj = (await calcHashSample(file)) as { hashValue: string };
    const _fileHash = obj.hashValue;
    setFileHash(_fileHash);
    // 判断文件是否存在,如果不存在，获取已经上传的切片
    const { uploaded } = await verify(file.name, obj.hashValue);
    // 判断文件是否存在,如果不存在，获取已经上传的切片
    if (uploaded) {
      setStatus(Status.done);
      setProgress(100);
      return alert("秒传:上传成功");
    }
    await execUpload(file, _fileSize, _fileHash, cur, offset, count);
    // 可以发送合并操作了
    if (!paused.current) {
      // await mergeRequest(chunksSize, _fileHash);
      await mergeRequest(
        [0, 2 * 1024 * 1024, ...chunkList.current.map((item) => item.offset)],
        _fileHash,
      );
      setStatus(Status.done);
    }
  };
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={uploadFile}>upload</Button>
      <Button onClick={handlePause} variant={"secondary"}>
        pause
      </Button>
      <Button onClick={handleResume} variant={"secondary"}>
        resume
      </Button>
      <div>状态： {status}</div>
      <Progress value={progress} max={100} />
    </div>
  );
};
