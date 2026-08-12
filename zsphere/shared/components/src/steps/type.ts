import { StepsProps } from "antd/lib/steps";

export interface IStepsProps extends Omit<StepsProps, "title"> {
  title?: React.ReactNode;
  desc?: React.ReactChild;
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void;
}
