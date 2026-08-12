export interface ActionCompletionResult {
  total: number;
  success: number;
  fail: number;
  exception: number;
}

export const isSuccessfulActionResult = (
  result: ActionCompletionResult,
): boolean =>
  result.total > 0 &&
  result.success === result.total &&
  result.fail === 0 &&
  result.exception === 0;
