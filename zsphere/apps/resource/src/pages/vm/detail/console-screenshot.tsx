import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { queryScreenshot } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { verifyOpenConsole } from "@zstack/virtualization-resource/src/pages/vm/action/validators";
import { Illustration } from "@zstack/zsphere-illustration";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import useOpenConsoleAction from "../action/open-console";

import styles from "@zstack/virtualization-resource/src/pages/vm/detail/style.module.less";

const STYLE_HEIGHT_100_PERCENT = { height: "100%" } as const;

interface IConsoleScreenshotProps {
  current: VmInstance;
}

export const ConsoleScreenshot: FC<IConsoleScreenshotProps> = ({ current }) => {
  const intl = useIntl();
  const spice = current?.systemTag?.vmConsoleMode === "spice";
  const canOpenConsole = verifyOpenConsole(current) && !spice && !!current.uuid;
  const [imageData, setImageData] = useState("");

  const openVncConsole = useOpenConsoleAction();

  const [_queryScreenshot, { data: _data }] = useLazyQuery(queryScreenshot, {
    fetchPolicy: "no-cache",
    onCompleted(data) {
      if (data) {
        setImageData(data?.screenshot?.imageData);
      }
    },
  });

  const handleQueryScreenshot = useCallback(() => {
    _queryScreenshot({
      variables: {
        uuid: current.uuid,
      },
    });
  }, [_queryScreenshot, current]);

  useEffect(() => {
    if (current.state === "Running") {
      const intervalId = setInterval(handleQueryScreenshot, 5000);

      handleQueryScreenshot();

      return () => {
        clearInterval(intervalId);
        setImageData("");
      };
    }
  }, [handleQueryScreenshot, current]);

  const renderConsoleScreenshot = () => {
    if (imageData && !spice) {
      return (
        <img
          alt="vmConsoleScreenshot"
          width="120px"
          height="68px"
          src={`${imageData}`}
        />
      );
    }
    let disabledInfo = "";
    if (!canOpenConsole && spice) {
      disabledInfo = intl.formatMessage({
        id: "vm.screenshot.spice.nosupport",
        defaultMessage: "SPICE Mode Unsupported",
      });
    }
    if (!canOpenConsole && !spice) {
      disabledInfo = intl.formatMessage({
        id: "vm.screenshot.vm.not.running",
        defaultMessage: "VM Not Running",
      });
    }
    return (
      <>
        <Illustration
          style={STYLE_HEIGHT_100_PERCENT}
          type="console.default"
          size={120}
        />
        <div className={styles["console-disable-word"]}>{disabledInfo}</div>
      </>
    );
  };

  const handleClick = () => {
    if (canOpenConsole) {
      openVncConsole(current);
    }
  };

  return (
    <div className={styles["icon-container"]} onClick={handleClick}>
      {renderConsoleScreenshot()}
      <div
        className={styles["icon-container-button"]}
        style={{ color: canOpenConsole ? "#FFFFFF" : "#96989B" }}
      >
        {intl.formatMessage({
          id: "vm.modal.install.GuestTools.go.to.console",
          defaultMessage: "Launch Console",
        })}
      </div>
      {!canOpenConsole && (
        <Tooltip
          title={
            spice
              ? intl.formatMessage({
                  id: "vm.open.console.disabled.by.spice.tooltip",
                  defaultMessage:
                    "SPICE cannot open the console, please use a local client to connect...",
                })
              : intl.formatMessage({
                  id: "vm.open.console.disabled.tooltip",
                  defaultMessage:
                    "The VM is not running. Real-time console cannot be obtained or launched.",
                })
          }
        >
          <div className={styles["icon-container-tooltip"]} />
        </Tooltip>
      )}
    </div>
  );
};
