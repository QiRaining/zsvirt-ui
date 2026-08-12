import { createContext } from "react";

interface BackupStorageCreateContextProps {
  source: any;
  setSource: (source: any) => void;
}

const BackupStorageCreateContext =
  createContext<BackupStorageCreateContextProps>({
    source: {},
    setSource: () => {},
  });

export default BackupStorageCreateContext;
