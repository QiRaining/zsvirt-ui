import { useState, useEffect } from "react";

interface UseExampleOptions {
  /**
   * 初始值
   */
  initialValue?: number;
  /**
   * 最大值
   */
  max?: number;
  /**
   * 最小值
   */
  min?: number;
}

interface UseExampleReturn {
  /**
   * 当前值
   */
  count: number;
  /**
   * 增加
   */
  increment: () => void;
  /**
   * 减少
   */
  decrement: () => void;
  /**
   * 重置
   */
  reset: () => void;
  /**
   * 设置值
   */
  setValue: (value: number) => void;
}

/**
 * 示例 Hook
 * 展示如何创建一个标准的自定义 Hook
 */
export const useExample = (
  options: UseExampleOptions = {},
): UseExampleReturn => {
  const { initialValue = 0, max, min } = options;
  const [count, setCount] = useState(initialValue);

  useEffect(() => {
    if (max !== undefined && count > max) {
      setCount(max);
    }
    if (min !== undefined && count < min) {
      setCount(min);
    }
  }, [count, max, min]);

  const increment = () => {
    setCount((prev) => {
      const next = prev + 1;
      return max !== undefined && next > max ? prev : next;
    });
  };

  const decrement = () => {
    setCount((prev) => {
      const next = prev - 1;
      return min !== undefined && next < min ? prev : next;
    });
  };

  const reset = () => {
    setCount(initialValue);
  };

  const setValue = (value: number) => {
    if (max !== undefined && value > max) {
      setCount(max);
      return;
    }
    if (min !== undefined && value < min) {
      setCount(min);
      return;
    }
    setCount(value);
  };

  return {
    count,
    increment,
    decrement,
    reset,
    setValue,
  };
};
