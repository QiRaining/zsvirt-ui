import { useIntl } from "react-intl";

export type StateType =
  | "Created"
  | "Starting"
  | "Running"
  | "Stopping"
  | "Stopped"
  | "Rebooting"
  | "Destroying"
  | "Destroyed"
  | "Migrating"
  | "Expunging"
  | "Pausing"
  | "Paused"
  | "Resuming"
  | "VolumeMigrating"
  | "Error"
  | "Unknown"
  | string;

export type StateMapType = {
  [key in StateType]: string;
};

const useStateI18n = () => {
  const intl = useIntl();
  const stateMap: StateMapType = {
    Created: intl.formatMessage({
      id: "created",
      defaultMessage: "Created",
    }),
    Starting: intl.formatMessage({
      id: "starting",
      defaultMessage: "Starting",
    }),
    Running: intl.formatMessage({
      id: "running",
      defaultMessage: "Running",
    }),
    Stopping: intl.formatMessage({
      id: "stopping",
      defaultMessage: "Stopping",
    }),
    Stopped: intl.formatMessage({
      id: "stopped",
      defaultMessage: "Stopped",
    }),
    Rebooting: intl.formatMessage({
      id: "rebooting",
      defaultMessage: "Rebooting",
    }),
    Destroying: intl.formatMessage({
      id: "destroying",
      defaultMessage: "Deleting",
    }),
    Destroyed: intl.formatMessage({
      id: "destroyed",
      defaultMessage: "Deleted",
    }),
    Migrating: intl.formatMessage({
      id: "migrating.hotMigrating",
      defaultMessage: "Hot Migrating",
    }),
    Expunging: intl.formatMessage({
      id: "expunging",
      defaultMessage: "Expunging",
    }),
    Pausing: intl.formatMessage({
      id: "pausing",
      defaultMessage: "Pausing",
    }),
    Paused: intl.formatMessage({
      id: "paused",
      defaultMessage: "Paused",
    }),
    Resuming: intl.formatMessage({
      id: "resuming",
      defaultMessage: "Resuming",
    }),
    VolumeMigrating: intl.formatMessage({
      id: "volume.migrating",
      defaultMessage: "Cold Migrating",
    }),
    Error: intl.formatMessage({
      id: "error",
      defaultMessage: "Error",
    }),
    Unknown: intl.formatMessage({
      id: "unknown",
      defaultMessage: "Unknown",
    }),
  };

  return (state: StateType) => stateMap[state];
};

export default useStateI18n;
