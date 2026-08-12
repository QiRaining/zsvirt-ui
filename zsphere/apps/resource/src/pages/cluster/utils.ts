import type { DocumentNode } from "@apollo/client";
import type {
  IActionParams,
  ITaskResult,
  IActionResult,
} from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";

interface FormatDoActionParams {
  action: {
    name: string;
    total: number;
  };
  payload: any;
  onProgress?: (arg: ITaskResult) => void;
  onFinish?: (arg: IActionResult) => void;
  type?: string;
}

export const formatDoActionParams = (
  params: FormatDoActionParams,
  mutation: DocumentNode,
): IActionParams => {
  const {
    action: { name, total },
    payload,
    onProgress,
    onFinish,
    type,
  } = params;

  return {
    mutation,
    payload,
    name,
    total,
    onProgress,
    onFinish,
    type,
  };
};

export const useFormatDoAction = (
  params: FormatDoActionParams,
  mutation: DocumentNode,
) => {
  const doAction = useAction();
  return () => doAction(formatDoActionParams(params, mutation));
};
