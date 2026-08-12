import { useActionConfig } from "@zstack/zsphere-engine/src/endpoint-sms-address";
import type {
  BasicEndPoint as IBasicEndPoint,
  EndPointSmsAddress as IEndPointSmsAddress,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import AddModal from "../action/add-sms-address-modal";
import DeleteModal from "../action/delete-sms-address-modal";
import ModifyModal from "../action/modify-sms-address-modal";

export default (currentEndpoint: IBasicEndPoint) => {
  return useActionConfig<IEndPointSmsAddress>([
    {
      key: "add.endpoint.address",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: (props: any) => (
        <AddModal {...props} currentEndpointUuid={currentEndpoint?.uuid} />
      ),
    },
    {
      key: "modify.endpoint.address",
      ActionWrapper: (props: any) => (
        <ModifyModal
          {...props}
          currentEndpointUuid={currentEndpoint?.uuid}
          currentEndpointName={currentEndpoint?.name}
        />
      ),
    },
    {
      key: "delete",
      // preValidators: [verifyDelete],
      ActionWrapper: (props: any) => (
        <DeleteModal {...props} currentEndpointUuid={currentEndpoint?.uuid} />
      ),
    },
  ]);
};
