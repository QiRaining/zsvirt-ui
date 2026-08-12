
import { Icon } from "@zstack/icon";
import React from "react";

import { Input } from "../input";
import { Text } from "../text";

interface SingleFileUploadProps {
  /** 原始文件数据 */
  file: File;
  onChange?: (file?: File) => void;
  /** 文件名后缀 */
  accept: string;
}

/** 适用于单文件上传、与表单配合的场景 */
export const FileUploadSingle: React.FC<SingleFileUploadProps> = ({
  file,
  onChange,
  accept,
}) => {
  const fileLoaderRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target?.files;
    // 只有当用户真正选择了文件时才更新
    if (files && files.length > 0) {
      const selectedFilesArr = Array.from(files);

      onChange?.(selectedFilesArr[0]);
    } else {
      // 如果用户点击取消，不做任何操作，保留原有文件
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();

    onChange?.();

    const fileInput = fileLoaderRef.current;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="group flex flex-col">
      <div className="relative flex items-center">
        <Input
          type="text"
          className="group-hover:border-theme-600 w-80 flex-grow cursor-pointer rounded-xs border-neutral-400"
          readOnly
          onClick={() => fileLoaderRef.current?.click()}
        />
        <div
          className="absolute box-border flex w-70 cursor-pointer items-center justify-between border-neutral-400 pr-2 pl-3"
          onClick={() => fileLoaderRef.current?.click()}
        >
          {file && (
            <>
              <div className="mx-1 flex min-w-0 flex-1 items-center">
                <Icon type="folder" className="text-neutral-700" />
                <Text className="ml-1 text-neutral-700">{file.name}</Text>
              </div>
              <span
                className="flex cursor-pointer items-center opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleDelete}
              >
                <Icon type="close-circle-fill" className="text-neutral-400" />
              </span>
            </>
          )}
        </div>
        <span
          className="absolute right-px flex h-7.5 cursor-pointer items-center rounded-r-sm bg-neutral-200 px-3"
          onClick={() => fileLoaderRef.current?.click()}
        >
          <Icon type="cloud-upload" />
        </span>
      </div>
      <input
        ref={fileLoaderRef}
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
      />
    </div>
  );
};
