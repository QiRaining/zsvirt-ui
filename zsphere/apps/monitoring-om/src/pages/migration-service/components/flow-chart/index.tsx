import React, { useMemo } from "react";

import { useContainerWidth } from "../../hooks";
import { computeLayout } from "./compute-layout";
import { DeploymentFlow } from "./deployment-flow";
import { MigrationFlow } from "./migration-flow";
import { NetworkArchitectureFlow } from "./network-architecture-flow";

import style from "../style.module.less";

const InstallationGuide: React.FC = () => {
  const { containerRef, width } = useContainerWidth();

  const layout = useMemo(() => computeLayout(width), [width]);

  return (
    <div className={style.guide} ref={containerRef}>
      <div className={style["guide-flowchart"]}>
        {width > 0 && (
          <>
            {/* SVG 0: Overall network architecture */}
            <NetworkArchitectureFlow />

            {/* SVG 1: Deployment Flow */}
            <DeploymentFlow layout={layout} />

            {/* SVG 2: Migration Execution Flow */}
            <MigrationFlow layout={layout} />
          </>
        )}
      </div>
    </div>
  );
};

export default InstallationGuide;

/**
 * Standalone migration flow guide (without deployment flow).
 * Used in the overview page after the service is already installed.
 */
export const MigrationGuide: React.FC = () => {
  const { containerRef, width } = useContainerWidth();

  const layout = useMemo(() => computeLayout(width), [width]);

  return (
    <div className={style.guide} ref={containerRef}>
      <div className={style["guide-flowchart"]}>
        {width > 0 && <NetworkArchitectureFlow />}
        {width > 0 && <MigrationFlow layout={layout} />}
      </div>
    </div>
  );
};
