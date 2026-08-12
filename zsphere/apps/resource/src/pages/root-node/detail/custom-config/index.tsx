import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { Auth, usePersistTabState } from "@zstack/zsphere-components";
import React, { useRef } from "react";
import { useIntl } from "react-intl";

const PreconfigurationTemplateList = React.lazy(() =>
  import("zsv_baremetal/baremetal-pre-config-template/list").catch(() => ({
    default: () => null,
  })),
);

import style from "./style.module.less";

const CustomConfig: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const intl = useIntl();
  const { activeKey, onChange } = usePersistTabState("customConfig", [
    // 'vmSpec',
    "baremetalTemplate",
  ]);

  const radioGroupMarginStyle = { marginBottom: 12 } as const;

  return (
    <AuthCheck
      resourceTypes={[
        // 'virtualization.vm',
        "virtualization.bm.template",
      ]}
    >
      <div className={style.container} ref={containerRef}>
        <RadioGroup
          value={activeKey}
          style={radioGroupMarginStyle}
          onValueChange={(value) => onChange(value)}
          variant="outline"
          options={[
            /* {
              value: "vmSpec",
              label: intl.formatMessage({
                id: 'virtualization.custom.config.vm.spec',
                defaultMessage: '虚拟机规范'
              }),
            }, */
            {
              value: "baremetalTemplate",
              label: intl.formatMessage({
                id: "virtualization.custom.config.baremetal.template",
                defaultMessage: "Bare Metal Template",
              }),
            },
          ]}
        />

        {/* {activeKey === 'vmSpec' && <div>虚拟机规范内容</div>} */}
        {activeKey === "baremetalTemplate" && (
          <React.Suspense fallback={null}>
            <PreconfigurationTemplateList
              view="main"
              getDetailContainer={() => containerRef.current!}
            />
          </React.Suspense>
        )}
      </div>
    </AuthCheck>
  );
};

export default CustomConfig;
