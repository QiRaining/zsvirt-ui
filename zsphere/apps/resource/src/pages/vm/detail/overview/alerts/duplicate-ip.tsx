import useCheckVNicIpAvailability from "@zstack/virtualization-resource/src/pages/vm/hooks/use-check-vnic-ip";
import { Alert } from "@zstack/zsphere-design-biz";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { isNil as _isNil, reduce as _reduce } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

const STYLE_MARGIN_BOTTOM_12 = { marginBottom: 12 } as const;

interface IProps {
  current: IVM;
  setEditConfigVisible: (visible: boolean) => void;
}

// migrate from origin alerts file, logic not changed

const DuplicateIpAlert: React.FC<IProps> = ({
  current,
  setEditConfigVisible,
}) => {
  const intl = useIntl();

  const {
    data,
    remoteCheckVNicIpAvailability,
    loading: checkVNicIpLoading,
  } = useCheckVNicIpAvailability();

  React.useEffect(() => {
    remoteCheckVNicIpAvailability({
      variables: {
        input: {
          vmNicUuids: current?.vmNics?.map((nic) => nic.uuid) || [],
        },
      },
    });
  }, [current?.vmNics]);

  const duplicateIpAlertEle = React.useMemo(() => {
    const { available, duplicateIps = [] } =
      data?.checkVNicIpAvailability || {};

    const portGroupNames: string[] = [];

    // vm 自身
    _reduce(
      current?.vmNics,
      (obj, nic) => {
        if (_isNil(nic.ip)) {
          return obj;
        }

        const key = nic.l3Network?.l2NetworkUuid + nic.ip?.split(".").join("");
        const value = nic.l3Network?.name;
        if (!obj[key]) {
          obj[key] = [value];
        } else {
          obj[key].push(value);
          portGroupNames.push(...new Set(obj[key]));
        }

        return obj;
      },
      {} as any,
    );

    // 其他 vm
    if (!checkVNicIpLoading && !available) {
      current?.vmNics
        ?.filter((nic) =>
          nic.usedIps?.some(({ ip }) => ip && duplicateIps.includes(ip)),
        )
        ?.forEach((nic) => {
          portGroupNames.push(nic.l3Network?.name);
        });
    }

    if (portGroupNames.length) {
      return (
        <Alert
          variant="warning"
          closable
          style={STYLE_MARGIN_BOTTOM_12}
          guideAction={{
            text: intl.formatMessage({
              id: "go.edit.config",
              defaultMessage: "To modify",
            }),
            onClick: () => setEditConfigVisible(true),
          }}
        >
          {intl.formatMessage(
            {
              id: "vm.duplicate.ip.alert",
              defaultMessage:
                "portGroupNames",
            },
            {
              portGroupNames: portGroupNames?.join(", "),
            },
          )}
        </Alert>
      );
    }

    return null;
  }, [
    current.vmNics,
    data?.checkVNicIpAvailability,
    intl,
    checkVNicIpLoading,
    setEditConfigVisible,
  ]);

  return duplicateIpAlertEle;
};

export default DuplicateIpAlert;
