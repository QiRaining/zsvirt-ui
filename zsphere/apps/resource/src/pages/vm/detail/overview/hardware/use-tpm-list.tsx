import { State } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useTpmList = (detail: IVM) => {
  const intl = useIntl();

  const list = useMemo(() => {
    // 从 tpmList 中获取 TPM 信息
    const tpmList = detail?.tpmList || [];

    if (!tpmList || tpmList.length === 0) {
      return [];
    }

    return [
      {
        label: (
          <>
            <Illustration type="illustration-lock" size={16} />
            {intl.formatMessage({
              id: "virtualization.hardware.item.tpm",
              defaultMessage: "TPM",
            })}
          </>
        ),
        value: (
          <State
            name={intl.formatMessage({
              id: "tpm.status.added",
              defaultMessage: "Added",
            })}
            prefix="dot"
            type="running"
          />
        ),
        children: [
          {
            label: intl.formatMessage({
              id: "virtualization.tpm.enabled",
              defaultMessage: "Trusted Platform Module",
            }),
            value: (
              <State
                name={intl.formatMessage({
                  id: "tpm.status.added",
                  defaultMessage: "Added",
                })}
                prefix="dot"
                type="running"
              />
            ),
          },
          {
            label: intl.formatMessage({
              id: "virtualization.tpm.specification",
              defaultMessage: "TPM Spec",
            }),
            value: "2.0",
          },
        ],
      },
    ];
  }, [detail, intl]);

  return list;
};
