import { useEffect, useRef } from "react";

import { useActionConfig as useBaremetalChassisActionConfig } from "../pages/baremetal-chassis/config";
import { useActionConfig as useBaremetalClusterActionConfig } from "../pages/baremetal-cluster/config";
import { useActionConfig as useBaremetalInstanceActionConfig } from "../pages/baremetal-instance/config";

interface BaremetalActionConfigBridgeProps {
  onConfigReady: (configs: {
    "baremetal-chassis": any;
    "baremetal-cluster": any;
    "baremetal-instance": any;
  }) => void;
}

/**
 * Stable serialization for action config objects.
 * Strips non-serializable values (functions, React elements) so that
 * JSON.stringify produces a consistent snapshot for deep-equality checks.
 */
function configFingerprint(config: any): string {
  return JSON.stringify(config, (_key, value) => {
    if (typeof value === "function") {
      return;
    }
    if (value?.$$typeof) {
      return;
    } // React element
    return value;
  });
}

/**
 * Bridge component that calls baremetal useActionConfig hooks
 * and reports results back to the resource app via callback.
 * Renders nothing — purely a hook-calling bridge.
 */
const BaremetalActionConfigBridge: React.FC<
  BaremetalActionConfigBridgeProps
> = ({ onConfigReady }) => {
  const chassisConfig = useBaremetalChassisActionConfig();
  const clusterConfig = useBaremetalClusterActionConfig();
  const instanceConfig = useBaremetalInstanceActionConfig();

  const onConfigReadyRef = useRef(onConfigReady);
  onConfigReadyRef.current = onConfigReady;

  const prevFingerprintRef = useRef<string>("");

  useEffect(() => {
    const fingerprint = configFingerprint({
      chassis: chassisConfig,
      cluster: clusterConfig,
      instance: instanceConfig,
    });

    if (fingerprint === prevFingerprintRef.current) {
      return;
    }
    prevFingerprintRef.current = fingerprint;

    onConfigReadyRef.current({
      "baremetal-chassis": chassisConfig,
      "baremetal-cluster": clusterConfig,
      "baremetal-instance": instanceConfig,
    });
  }, [chassisConfig, clusterConfig, instanceConfig]);

  return null;
};

export default BaremetalActionConfigBridge;
