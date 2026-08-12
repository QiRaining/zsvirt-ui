import { Empty } from "@zstack/zsphere-components";
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";

import BackupDataDetails from "../vmInstance/backup-data-details";
import BackupDataTree from "../vmInstance/backup-data-tree";

import styles from "./style.module.less";

interface IProps {
  source?: IZSVBackupStorage;
  store: any;
  setStore: (store: any) => void;
}

const RESIZABLE_SIZE_KEY = "protectedResourceListWidth";
const DEFAULT_WIDTH = 480;

const VmContainer: FC<IProps> = ({ source, store, setStore }) => {
  const intl = useIntl();
  const treeRef = useRef<any>();
  const [_resizing, setResizing] = useState(false);

  const handleResizeStop = () => {
    window.dispatchEvent(new Event("resize")); // 刷新 Text 组件, 展示/隐藏 Tooltip
  };

  return (
    <div className={styles.vmContainer}>
      <ResizableLayout
        storageKey={RESIZABLE_SIZE_KEY}
        defaultSize={DEFAULT_WIDTH}
        minSize={320}
        maxSize={600}
        direction="horizontal"
        resizeEdge="right"
        onResizingChange={setResizing}
        onResizeStop={handleResizeStop}
      >
        <BackupDataTree
          source={source}
          store={store}
          setStore={setStore}
          treeRef={treeRef}
        />
      </ResizableLayout>
      <div className={styles.vmRightContainer}>
        {store?.key ? (
          <BackupDataDetails
            onClickName={(value) => treeRef.current?.selectNode(value.uuid)}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: "100%" }}
          >
            <Empty
              type="Table"
              description={intl.formatMessage({
                id: "no.data",
                defaultMessage: "No Data",
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VmContainer;
