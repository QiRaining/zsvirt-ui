import { useDebounceFn, usePersistFn } from "ahooks";
import { useState, useEffect } from "react";

export function useDebounce(props: {
  value?: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
}): {
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
} {
  const [value, onChange] = useState<any>(props.value);

  const { run } = useDebounceFn((e) => props.onChange?.(e), {
    wait: 200,
  });

  const changeHandle = usePersistFn((e: React.ChangeEvent<any>) => {
    // 当与 Form.Itme 搭配使用时，Form.Item 取出事件对象的value。
    // 而 Debounce 是异步，会造成事件对象内容被回收。从而造成数据设置异常。
    // 因此需要将事件对象从事件池中提取出来。 React 17 删除
    e.persist();

    if ("onChange" in props) {
      run(e);
    }

    onChange(e.target.value);
  });

  useEffect(() => {
    if (props.value !== value) {
      onChange(props.value);
    }
  }, [props.value]);

  return {
    value,
    onChange: changeHandle,
  };
}
