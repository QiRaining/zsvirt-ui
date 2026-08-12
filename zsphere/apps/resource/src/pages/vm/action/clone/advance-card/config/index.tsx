import { ZSVFormTabs } from "@zstack/zsphere-design-biz";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { CloneVmValues } from "../../schema";
import GeneralConfig from "./general-config";

interface ConfigProps {
  form: UseFormReturn<CloneVmValues>;
  sourceVm?: any;
}

const Config: React.FC<ConfigProps> = ({ form, sourceVm }) => {
  const intl = useIntl();

  return (
    <div className="mb-6 flex h-80 w-[754px] flex-col overflow-hidden rounded-xs border border-solid border-neutral-300">
      <ZSVFormTabs
        contentClassName="!h-80 !flex-1 !overflow-y-auto !py-5 !pr-0.5 !pl-5"
        contentId="clone-vm-config-tab"
        framed={false}
        orientation="side"
        rootClassName="h-80 focus-visible:!outline-none"
        tabs={[
          {
            key: "general",
            className:
              "data-[state=active]:bg-[var(--color-50)] data-[state=active]:[&>div]:bg-[var(--color-50)] data-[state=active]:text-theme-600",
            title: intl.formatMessage({
              id: "virtualization.create.instance.advance.config.general.config",
              defaultMessage: "General Options",
            }),
            content: <GeneralConfig form={form} sourceVm={sourceVm} />,
          },
        ]}
        value="general"
      />
    </div>
  );
};

export default React.memo(Config);
