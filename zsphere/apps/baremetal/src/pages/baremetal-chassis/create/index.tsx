import type { SelectWayEntry } from "@zstack/zsphere-design-biz";
import { DialogSelectWay } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import CreateBaremetalChassisByHand from "./create-by-hand";
import CreateBaremetalChassisByHandByImport from "./create-by-import";

export type ICreateWay = "hand" | "import";

const EnterSelect: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  selectedList,
  source,
}) => {
  const intl = useIntl();
  const [createWay, setCreateWay] = useState<ICreateWay>("hand");
  const [createBmChassisByHandVisible, setCreateBmChassisByHandVisible] =
    useState(false);
  const [createBmChassisByImportVisible, setCreateBmChassisByImportVisible] =
    useState(false);

  useEffect(() => {
    if (visible) {
      setCreateWay("hand");
    }
  }, [visible]);

  const entries: SelectWayEntry[] = useMemo(
    () => [
      {
        icon: "file-add",
        title: intl.formatMessage({
          id: "manualAdd",
          defaultMessage: "Manual Addition",
        }),
        value: "hand",
        description: intl.formatMessage({
          id: "manualAdd.tip",
          defaultMessage:
            "Add single or multiple bare metal chassis by specifying an IPMI address or IPMI range.",
        }),
      },
      {
        icon: "file-text",
        title: intl.formatMessage({
          id: "templateImportant",
          defaultMessage: "Template Import",
        }),
        value: "import",
        description: intl.formatMessage({
          id: "templateImportant.tip",
          defaultMessage:
            "Use a CSV configuration file. Enter bare metal chassis information in the specified format and upload the file.",
        }),
      },
    ],
    [intl],
  );

  const onConfirm = useCallback(() => {
    if (createWay === "hand") {
      setCreateBmChassisByHandVisible(true);
    } else if (createWay === "import") {
      setCreateBmChassisByImportVisible(true);
    }
  }, [createWay]);

  return (
    <>
      <DialogSelectWay
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "create.baremetai.chassis.way.select.modal.title",
          defaultMessage: "Select Bare Metal Chassis Addition Type",
        })}
        entries={entries}
        value={createWay}
        onChange={(v) => setCreateWay(v as ICreateWay)}
        tip={intl.formatMessage({
          id: "baremetal.chassis.modal.title.create.way.tip",
          defaultMessage: "Choose a type to add a bare metal chassis.",
        })}
        onConfirm={onConfirm}
      />

      <CreateBaremetalChassisByHand
        visible={createBmChassisByHandVisible}
        setVisible={setCreateBmChassisByHandVisible}
        view=""
        source={{ zone: selectedList?.[0] || source }}
        selectedList={selectedList}
        position="row"
      />

      <CreateBaremetalChassisByHandByImport
        visible={createBmChassisByImportVisible}
        setVisible={setCreateBmChassisByImportVisible}
        view=""
        source={{ zone: selectedList?.[0] || source }}
        selectedList={selectedList}
        position="row"
      />
    </>
  );
};

export default EnterSelect;
