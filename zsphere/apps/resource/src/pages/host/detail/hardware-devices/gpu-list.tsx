import { RadioGroup } from "@zstack/design";
import GPUList from "@zstack/virtualization-resource/src/pages/gpu-device/list";
import VGPUList from "@zstack/virtualization-resource/src/pages/vgpu-device/list";
import { useAuth } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

export interface IProps {
  current: HostVO;
  gpuCount?: number;
  vGpuCount?: number;
}

export default function GpuList({
  current,
  gpuCount = 0,
  vGpuCount = 0,
}: IProps) {
  const intl = useIntl();
  const [tab, setTab] = useState("gpu");
  const { hasAuth } = useAuth();

  const hasVGpuAuth = hasAuth({
    authKey: "vgpu",
    resource: "host",
    type: "block",
  });

  return (
    <>
      <RadioGroup
        style={RADIO_GROUP_STYLE}
        value={tab}
        onValueChange={(value) => {
          setTab(value);
        }}
        variant="outline"
        options={[
          {
            value: "gpu",
            label: `${intl.formatMessage({
              id: "host.gpu",
              defaultMessage: "Physical GPU",
            })} (${gpuCount})`,
          },
          ...(hasVGpuAuth
            ? [
                {
                  value: "vgpu",
                  label: `${intl.formatMessage({
                    id: "host.vgpu",
                    defaultMessage: "vGPU",
                  })} (${vGpuCount})`,
                },
              ]
            : []),
        ]}
      />
      {tab === "gpu" ? (
        <GPUList
          view="sub.host"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
            ],
          }}
        />
      ) : (
        <VGPUList
          view="sub.host"
          defaultQuery={{
            conditions: [
              {
                key: "hostUuid",
                value: current.uuid,
              },
              {
                key: "type",
                op: Op.in,
                values: ["GPU_Video_Controller", "GPU_3D_Controller"],
              },
            ],
          }}
        />
      )}
    </>
  );
}
