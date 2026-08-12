import { useMutation } from "@apollo/client";
import { checkVNicIpAvailability } from "@zstack/virtualization-resource/src/gql/vm-nic.gql";
import type {
  CheckVNicAvailabilityResult,
  CheckVNicIpAvailabilityParam,
} from "@zstack/zsphere-types/graphql";

const useCheckVNicIpAvailability = () => {
  const [remoteCheckVNicIpAvailability, { data, loading }] = useMutation<
    { checkVNicIpAvailability: CheckVNicAvailabilityResult },
    {
      input: CheckVNicIpAvailabilityParam;
    }
  >(checkVNicIpAvailability);

  return {
    loading,
    data,
    remoteCheckVNicIpAvailability,
  };
};

export default useCheckVNicIpAvailability;
