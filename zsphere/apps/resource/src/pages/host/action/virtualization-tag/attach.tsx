import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Tag as ITag, Host as IHost } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import HostList from "../../list";

const attachTag = gql`
  mutation attachTag($input: AttachTagInput!) {
    attachTag(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<IActionWrapperProps<IHost, ITag> & IProps> = ({
  visible,
  setVisible,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.host.action.attach.tag.modal.title",
    defaultMessage: "Attach Host",
  });

  const [value, onChange] = React.useState<Array<IHost>>([]);

  const defalutQuery = React.useMemo(
    () => ({
      conditions: [
        {
          key: "hypervisorType",
          op: Op.notIn,
          values: ["ESX", "baremetal2"],
        },
        {
          key: "__tagUuid__",
          op: Op.notIn,
          values: [source?.uuid],
        },
      ],
    }),
    [source],
  );

  const onOk = React.useCallback(async () => {
    const payload = [
      {
        tagUuid: source?.uuid,
        resourceUuids: value?.map((it) => it.uuid),
      },
    ];

    doAction({
      mutation: attachTag,
      payload,
      name: title,
      total: 1,
      type: "VmInstance",
      onProgress: () => {
        setSelectedList?.([]);
      },
    });
  }, [doAction, setSelectedList, source, title, value]);

  const footerEle = React.useMemo<JSX.Element>(() => {
    return (
      <>
        <Button key="cancel" onClick={() => setVisible(false)} variant="link">
          {intl.formatMessage({ id: "bottun.cancel", defaultMessage: "Cancel" })}
        </Button>
        <Button
          key="ok"
          variant="primary"
          onClick={() => onOk()}
          disabled={_.isEmpty(value)}
        >
          {intl.formatMessage({ id: "button.ok", defaultMessage: "OK" })}
        </Button>
      </>
    );
  }, [intl, onOk, setVisible, value]);

  React.useEffect(() => {
    if (visible) {
      onChange([]);
    }
  }, [visible]);

  return (
    <DialogBase
      title={title}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      widthClassName="w-[800px]"
      footer={footerEle}
    >
      <HostList
        view="select"
        value={value}
        onChange={onChange}
        defaultQuery={defalutQuery}
      />
    </DialogBase>
  );
};

export default Action;
