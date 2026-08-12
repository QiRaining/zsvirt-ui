import type { SelectWayEntry } from "@zstack/zsphere-design-biz";
import { DialogSelectWay } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useIntl } from "react-intl";

import CreateInstanceBaseOnTemplate from "../create-vm-by-resource/vm-template";
import { CreateInstanceContext } from "./context";
import { getZoneUuidBySource } from "./hooks/get-zoneuuid";
import CreateInstanceNormal from "./index";
import CreateInstanceImport from "./ovf-create";

const CreateInstance: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  source,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();

  const realSource =
    selectedList.length !== 0 ? selectedList[0] : (source as any);

  const { setRealSource } = useContext(CreateInstanceContext);

  const [createWay, setCreateWay] = useState("create");
  const [normalVisible, setNormalVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [templateSelectVisible, setTemplateSelectVisible] = useState(false);

  const entries: SelectWayEntry[] = useMemo(
    () => [
      {
        icon: "monitor",
        title: intl.formatMessage({
          id: "virtualization.create.instance.normal.way",
          defaultMessage: "New VM",
        }),
        value: "create",
        description: intl.formatMessage({
          id: "virtualization.create.instance.normal.way.description",
          defaultMessage: "A new virtual machine that you'll be able to customize CPU, memory, storage, and network.",
        }),
      },
      {
        icon: "upload",
        title: intl.formatMessage({
          id: "virtualization.create.instance.import.way",
          defaultMessage: "Import VM",
        }),
        value: "import",
        description: intl.formatMessage({
          id: "virtualization.create.instance.import.way.description",
          defaultMessage:
            "Upload an OVF file to quickly import virtual machines, facilitating VM migration across different platforms.",
        }),
      },
      {
        icon: "file-paste",
        title: intl.formatMessage({
          id: "virtualization.create.instance.template.way",
          defaultMessage: "From Template",
        }),
        value: "template",
        description: intl.formatMessage({
          id: "virtualization.create.instance.template.way.description",
          defaultMessage:
            "Deploy identical virtual machines from a template. You'll be able to customize hardware, software, and other configurations.",
        }),
      },
    ],
    [intl],
  );

  const onConfirm = useCallback(() => {
    switch (createWay) {
      case "create":
        setNormalVisible(true);
        break;
      case "import":
        setImportVisible(true);
        break;
      case "template":
        setTemplateVisible(true);
        setTemplateSelectVisible(true);
        break;
      default:
        setNormalVisible(true);
    }
    setVisible(false);
  }, [createWay, setVisible]);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(realSource);
  }, [realSource]);

  useEffect(() => {
    setRealSource?.((pre: any) => ({
      ...pre,
      zoneUuid,
      realSource,
    }));
  }, [realSource, zoneUuid, setRealSource]);

  return (
    <>
      <DialogSelectWay
        visible={visible}
        setVisible={setVisible}
        title={String(
          intl.formatMessage({
            id: "instance.modal.title.create.way.select.modal.title",
            defaultMessage: "Select VM Creation Type",
          }),
        )}
        entries={entries}
        value={createWay}
        onChange={setCreateWay}
        tip={intl.formatMessage({
          id: "instance.modal.title.create.way.tip",
          defaultMessage: "Choose a type to create a virtual machine.",
        })}
        onConfirm={onConfirm}
      />
      <CreateInstanceNormal
        visible={normalVisible}
        source={source}
        setVisible={setNormalVisible}
        selectedList={selectedList}
        view=""
        position="row"
      />
      <CreateInstanceImport
        visible={importVisible}
        source={source}
        setVisible={setImportVisible}
        selectedList={selectedList}
        view=""
        position="row"
      />
      <CreateInstanceBaseOnTemplate
        visible={templateVisible}
        source={source}
        setVisible={setTemplateVisible}
        selectedList={selectedList}
        view=""
        position="row"
        setTemplateSelectVisible={setTemplateSelectVisible}
        templateSelectVisible={templateSelectVisible}
      />
    </>
  );
};

export default CreateInstance;
