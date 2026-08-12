interface ITabPane {
  title: React.ReactNode;
  titleAlarm?: React.ReactNode;
  content: React.ReactNode;
  key: string;
}

export interface ITabProps {
  extra?: React.ReactNode;
  className?: string;
  tabs: ITabPane[];
}
