import { useState, useCallback } from "react";

export interface IProps {
  visible: boolean;
}

export default function useModalOpenState({ visible }: IProps) {
  const [open, setOpen] = useState(visible);

  if (visible && !open) {
    setOpen(true);
  }

  const afterClose = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, afterClose };
}
