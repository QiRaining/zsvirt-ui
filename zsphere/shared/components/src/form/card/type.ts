export interface ICardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  indented?: boolean;
  showLine?: boolean;
  className?: string;
  style?: import("react").CSSProperties;
  titleClassName?: string;
  children?: React.ReactNode;
}
