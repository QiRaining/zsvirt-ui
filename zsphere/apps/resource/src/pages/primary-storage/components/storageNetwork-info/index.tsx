import { Input } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import { isCidr } from "@zstack/zsphere-utils";
import type { FormProps } from "antd";
import {
  includes as _includes,
  every as _every,
  isUndefined as _isUndefined,
} from "lodash-es";
import React, { useMemo, useContext } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { PrimaryStorageTypeContext } from "../../create/contexts/storageContexts";
import type { IPrimaryStorageTypeContext } from "../../create/type";
import { getPrimaryStorageType } from "../../utils";

interface IProps {
  form: FormProps["form"];
  diskUuidList?: ICandidateSharedBlock[];
}

const StorageNetworkInfo: React.FC<IProps> = ({ diskUuidList = [] }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const { primaryStorageType, subPrimaryStorageType } = useContext(
    PrimaryStorageTypeContext,
  ) as IPrimaryStorageTypeContext;

  const storageNetwork: boolean = useMemo(() => {
    // 如果全是 FcLun 或者 NvmeLun 则隐藏

    const allFcLun: boolean =
      diskUuidList?.length > 0 &&
      _every(diskUuidList || [], (v: ICandidateSharedBlock) =>
        _includes(["fc"], v?.source),
      );
    const allNvmeLun: boolean =
      diskUuidList?.length > 0 &&
      _every(diskUuidList || [], (v: ICandidateSharedBlock) =>
        _includes(["nvme"], v?.source),
      );

    const validTypes = [
      `${PrimaryStorageType.Ceph}-ZCE`,
      PrimaryStorageType.NFS,
      PrimaryStorageType.SharedBlock,
    ];

    return (
      _includes(
        validTypes,
        getPrimaryStorageType(primaryStorageType, subPrimaryStorageType),
      ) && !(allFcLun || allNvmeLun)
    );
  }, [diskUuidList, primaryStorageType, subPrimaryStorageType]);

  return (
    <>
      {storageNetwork ? (
        <Form.Item
          name="cidr"
          label={intl.formatMessage({
            id: "storageNetwork",
            defaultMessage: "Storage Network",
          })}
          icon="info"
          iconTooltip={{
            title: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.primaryStorage.field.storageNetwork.tooltip",
                  defaultMessage: `### Storage Network

1. The storage network specified for the shared storage. The system uses the storage network to check the health status of virtual machines.
2. We recommend that you plan an independent storage network in advance to avoid potential risks. If you do not have an independent storage network, enter the network address according to your actual needs.`,
                })}
              </ReactMarkdown>
            ),
          }}
          tooltip={intl.formatMessage({
            id: "virtualization.primaryStorage.field.storageNetwork.hover",
            defaultMessage: "Example: 192.168.1.0/24",
          })}
          rules={[
            isRequired(),
            () => ({
              validator(rule, values) {
                if (_isUndefined(values) || values === "" || isCidr(values)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  Error(
                    intl.formatMessage({
                      id: "virtualization.primaryStorage.field.storageNetwork.validator.format",
                      defaultMessage: "Invalid CIDR.",
                    }),
                  ),
                );
              },
            }),
          ]}
        >
          <Input className="width-320" />
        </Form.Item>
      ) : null}
    </>
  );
};

export default StorageNetworkInfo;
